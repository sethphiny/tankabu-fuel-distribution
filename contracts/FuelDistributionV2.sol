// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FuelDistributionV2
 * @dev Hybrid fuel distribution system with on-chain rate management and checkpoint validation.
 */
contract FuelDistributionV2 is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant STATION_ROLE = keccak256("STATION_ROLE");
    bytes32 public constant DRIVER_ROLE = keccak256("DRIVER_ROLE");

    enum Status { PENDING, DISPATCHED, DELIVERED, CANCELLED }

    struct Checkpoint {
        string location;
        uint256 volumeRecorded;
        uint256 timestamp;
        address validator;
        bool isAnomaly;
    }

    struct Manifest {
        uint256 id;
        bytes32 productType;
        uint256 volume;
        uint256 pricePerLiter;
        uint256 totalPayment;
        address distributor; // This is the driver/fleet address
        address station;
        address depot;
        Status status;
        uint256 createdAt;
        uint256 deliveredAt;
        uint256 checkpointCount;
        mapping(uint256 => Checkpoint) checkpoints;
    }

    IERC20 public paymentToken;
    uint256 public manifestCount;
    mapping(uint256 => Manifest) public manifests;
    
    // On-chain rate management
    mapping(bytes32 => uint256) public productRates;

    event ManifestCreated(
        uint256 indexed id,
        bytes32 productType,
        uint256 volume,
        uint256 pricePerLiter,
        address indexed distributor,
        address indexed station,
        address depot
    );
    event CheckpointValidated(uint256 indexed manifestId, uint256 checkpointId, string location, uint256 volumeRecorded, bool isAnomaly);
    event RateUpdated(bytes32 indexed productType, uint256 oldRate, uint256 newRate);
    event DeliveryConfirmed(uint256 indexed id, uint256 deliveredAt);

    constructor(address _paymentToken, address _admin) {
        paymentToken = IERC20(_paymentToken);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(STATION_ROLE, _admin);
        _grantRole(DRIVER_ROLE, _admin);

        // Default rates
        productRates[keccak256("PMS")] = 10026 * 1e14;
        productRates[keccak256("AGO")] = 12000 * 1e14;
        productRates[keccak256("DPK")] = 9500 * 1e14;
    }

    function updateRate(bytes32 _productType, uint256 _newRate) external onlyRole(ADMIN_ROLE) {
        uint256 oldRate = productRates[_productType];
        productRates[_productType] = _newRate;
        emit RateUpdated(_productType, oldRate, _newRate);
    }

    function createManifest(
        bytes32 _productType,
        uint256 _volume,
        address _distributor,
        address _station,
        address _depot
    ) external nonReentrant returns (uint256) {
        require(hasRole(STATION_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        
        uint256 currentRate = productRates[_productType];
        require(currentRate > 0, "Product rate not set");
        
        uint256 totalPayment = _volume * currentRate;
        require(paymentToken.transferFrom(msg.sender, address(this), totalPayment), "Escrow failed");

        manifestCount++;
        Manifest storage m = manifests[manifestCount];
        m.id = manifestCount;
        m.productType = _productType;
        m.volume = _volume;
        m.pricePerLiter = currentRate;
        m.totalPayment = totalPayment;
        m.distributor = _distributor;
        m.station = _station;
        m.depot = _depot;
        m.status = Status.DISPATCHED;
        m.createdAt = block.timestamp;

        emit ManifestCreated(manifestCount, _productType, _volume, currentRate, _distributor, _station, _depot);
        return manifestCount;
    }

    /**
     * @dev Driver validates a checkpoint along the route.
     */
    function validateCheckpoint(
        uint256 _manifestId, 
        string calldata _location, 
        uint256 _volumeRecorded
    ) external nonReentrant {
        Manifest storage m = manifests[_manifestId];
        require(m.status == Status.DISPATCHED, "Invalid manifest status");
        require(msg.sender == m.distributor || hasRole(DRIVER_ROLE, msg.sender), "Not authorized driver");

        // Simple anomaly detection: if recorded volume is less than 95% of expected volume
        bool isAnomaly = _volumeRecorded < (m.volume * 95) / 100;

        m.checkpointCount++;
        m.checkpoints[m.checkpointCount] = Checkpoint({
            location: _location,
            volumeRecorded: _volumeRecorded,
            timestamp: block.timestamp,
            validator: msg.sender,
            isAnomaly: isAnomaly
        });

        emit CheckpointValidated(_manifestId, m.checkpointCount, _location, _volumeRecorded, isAnomaly);
    }

    function confirmDelivery(uint256 _id) external nonReentrant {
        Manifest storage manifest = manifests[_id];
        require(msg.sender == manifest.station || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        require(manifest.status == Status.DISPATCHED, "Invalid status");

        manifest.status = Status.DELIVERED;
        manifest.deliveredAt = block.timestamp;
        require(paymentToken.transfer(manifest.distributor, manifest.totalPayment), "Release failed");
        emit DeliveryConfirmed(_id, block.timestamp);
    }

    // Helper to fetch checkpoint details (Solidity doesn't return mappings in structs automatically)
    function getCheckpoint(uint256 _manifestId, uint256 _checkpointIndex) external view returns (
        string memory location,
        uint256 volumeRecorded,
        uint256 timestamp,
        address validator,
        bool isAnomaly
    ) {
        Checkpoint storage cp = manifests[_manifestId].checkpoints[_checkpointIndex];
        return (cp.location, cp.volumeRecorded, cp.timestamp, cp.validator, cp.isAnomaly);
    }
}
