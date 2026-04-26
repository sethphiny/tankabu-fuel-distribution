// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FuelDistribution
 * @dev An updated version of the FuelFlow contract for tracking fuel distribution manifests.
 * This version uses AccessControl for role-based permissions and ReentrancyGuard for security.
 */
contract FuelDistribution is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant DEPOT_ROLE = keccak256("DEPOT_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant STATION_ROLE = keccak256("STATION_ROLE");

    enum Status { PENDING, DISPATCHED, DELIVERED, CANCELLED }

    struct Manifest {
        uint256 id;
        bytes32 productType; // e.g., keccak256("PMS"), keccak256("AGO"), keccak256("DPK")
        uint256 volume;      // in Liters
        uint256 pricePerLiter;
        uint256 totalPayment;
        address distributor;
        address station;
        address depot;
        Status status;
        uint256 createdAt;
        uint256 deliveredAt;
    }

    IERC20 public paymentToken;
    uint256 public manifestCount;
    mapping(uint256 => Manifest) public manifests;

    event ManifestCreated(
        uint256 indexed id,
        bytes32 productType,
        uint256 volume,
        address indexed distributor,
        address indexed station,
        address depot
    );
    event DeliveryConfirmed(uint256 indexed id, uint256 deliveredAt);
    event PaymentReleased(uint256 indexed id, address indexed to, uint256 amount);
    event ManifestCancelled(uint256 indexed id);

    constructor(address _paymentToken, address _admin) {
        paymentToken = IERC20(_paymentToken);
        _grantRole(ADMIN_ROLE, _admin);
    }

    /**
     * @dev Create a new manifest and lock payment in escrow.
     * Can be called by someone with STATION_ROLE or ADMIN_ROLE.
     */
    function createManifest(
        bytes32 _productType,
        uint256 _volume,
        uint256 _pricePerLiter,
        address _distributor,
        address _station,
        address _depot
    ) external nonReentrant returns (uint256) {
        // Validation: msg.sender must be the station or an admin
        require(hasRole(STATION_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Not authorized to create");
        require(_volume > 0, "Volume must be > 0");
        
        uint256 totalPayment = _volume * _pricePerLiter;
        require(totalPayment > 0, "Total payment must be > 0");
        
        // Transfer tokens from sender to this contract (escrow)
        // Note: The sender must have approved the contract to spend totalPayment tokens
        require(paymentToken.transferFrom(msg.sender, address(this), totalPayment), "Escrow transfer failed");

        manifestCount++;
        manifests[manifestCount] = Manifest({
            id: manifestCount,
            productType: _productType,
            volume: _volume,
            pricePerLiter: _pricePerLiter,
            totalPayment: totalPayment,
            distributor: _distributor,
            station: _station,
            depot: _depot,
            status: Status.DISPATCHED,
            createdAt: block.timestamp,
            deliveredAt: 0
        });

        emit ManifestCreated(manifestCount, _productType, _volume, _distributor, _station, _depot);
        return manifestCount;
    }

    /**
     * @dev Confirm delivery and release funds to the distributor.
     * Only the station specified in the manifest can confirm delivery.
     */
    function confirmDelivery(uint256 _id) external nonReentrant {
        Manifest storage manifest = manifests[_id];
        require(msg.sender == manifest.station, "Only station can confirm");
        require(manifest.status == Status.DISPATCHED, "Invalid status");

        manifest.status = Status.DELIVERED;
        manifest.deliveredAt = block.timestamp;
        
        // Release funds to distributor
        require(paymentToken.transfer(manifest.distributor, manifest.totalPayment), "Release failed");

        emit DeliveryConfirmed(_id, block.timestamp);
        emit PaymentReleased(_id, manifest.distributor, manifest.totalPayment);
    }

    /**
     * @dev Admin can release funds in case of dispute or automated confirmation.
     */
    function adminReleaseFunds(uint256 _id) external onlyRole(ADMIN_ROLE) nonReentrant {
        Manifest storage manifest = manifests[_id];
        require(manifest.status == Status.DISPATCHED, "Invalid status");

        manifest.status = Status.DELIVERED;
        manifest.deliveredAt = block.timestamp;
        
        require(paymentToken.transfer(manifest.distributor, manifest.totalPayment), "Release failed");

        emit DeliveryConfirmed(_id, block.timestamp);
        emit PaymentReleased(_id, manifest.distributor, manifest.totalPayment);
    }

    /**
     * @dev Admin can cancel a manifest and refund the station.
     */
    function cancelManifest(uint256 _id) external onlyRole(ADMIN_ROLE) nonReentrant {
        Manifest storage manifest = manifests[_id];
        require(manifest.status == Status.DISPATCHED, "Can only cancel dispatched");

        manifest.status = Status.CANCELLED;
        
        // Refund station
        require(paymentToken.transfer(manifest.station, manifest.totalPayment), "Refund failed");

        emit ManifestCancelled(_id);
    }
}
