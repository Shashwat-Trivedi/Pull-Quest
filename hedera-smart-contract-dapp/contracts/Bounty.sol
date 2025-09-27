// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SecureBountyManager
 * @dev A secure contract for managing bounties tied to GitHub usernames
 * Features: Role-based access, withdrawal restrictions, audit trails
 */
contract SecureBountyManager {
    
    // Events for transparency and logging
    event BountyAdded(
        string indexed githubUsername,
        address indexed contributor,
        uint256 amount,
        uint256 timestamp,
        string memo
    );
    
    event BountyWithdrawn(
        string indexed githubUsername,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    event GitHubAddressMapped(
        string indexed githubUsername,
        address indexed walletAddress,
        uint256 timestamp
    );
    
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    
    // Structs
    struct Bounty {
        uint256 totalAmount;
        uint256 availableAmount;
        uint256 withdrawnAmount;
        uint256 contributorCount;
        bool exists;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    struct Contribution {
        address contributor;
        uint256 amount;
        uint256 timestamp;
        string memo;
    }
    
    // State variables
    mapping(string => Bounty) public bounties;
    mapping(string => address) public githubToAddress;
    mapping(address => string) public addressToGithub;
    mapping(string => Contribution[]) public bountyContributions;
    mapping(address => bool) public admins;
    
    address public owner;
    uint256 public totalBountiesCreated;
    uint256 public totalAmountLocked;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Only admin can call this function");
        _;
    }
    
    modifier validGithubUsername(string memory _githubUsername) {
        require(bytes(_githubUsername).length > 0, "GitHub username cannot be empty");
        require(bytes(_githubUsername).length <= 50, "GitHub username too long");
        _;
    }
    
    modifier bountyExists(string memory _githubUsername) {
        require(bounties[_githubUsername].exists, "Bounty does not exist for this GitHub username");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }
    
    /**
     * @dev Add an admin who can manage bounties
     * @param _admin Address to grant admin privileges
     */
    function addAdmin(address _admin) external onlyOwner {
        require(_admin != address(0), "Invalid admin address");
        require(!admins[_admin], "Address is already an admin");
        
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }
    
    /**
     * @dev Remove admin privileges
     * @param _admin Address to remove admin privileges from
     */
    function removeAdmin(address _admin) external onlyOwner {
        require(admins[_admin], "Address is not an admin");
        require(_admin != owner, "Cannot remove owner as admin");
        
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }
    
    /**
     * @dev Map a GitHub username to a wallet address
     * @param _githubUsername GitHub username
     * @param _walletAddress Wallet address to map to
     */
    function mapGithubToAddress(
        string memory _githubUsername, 
        address _walletAddress
    ) external onlyAdmin validGithubUsername(_githubUsername) {
        require(_walletAddress != address(0), "Invalid wallet address");
        
        // Clear previous mapping if exists
        string memory existingGithub = addressToGithub[_walletAddress];
        if (bytes(existingGithub).length > 0) {
            delete githubToAddress[existingGithub];
        }
        
        address existingAddress = githubToAddress[_githubUsername];
        if (existingAddress != address(0)) {
            delete addressToGithub[existingAddress];
        }
        
        githubToAddress[_githubUsername] = _walletAddress;
        addressToGithub[_walletAddress] = _githubUsername;
        
        emit GitHubAddressMapped(_githubUsername, _walletAddress, block.timestamp);
    }
    
    /**
     * @dev Add bounty for a GitHub username (Admin only)
     * @param _githubUsername GitHub username to add bounty for
     * @param _memo Optional memo describing the bounty
     */
    function addBountyForUser(
        string memory _githubUsername,
        string memory _memo
    ) external payable onlyAdmin validGithubUsername(_githubUsername) {
        require(msg.value > 0, "Bounty amount must be greater than 0");
        
        if (!bounties[_githubUsername].exists) {
            bounties[_githubUsername] = Bounty({
                totalAmount: 0,
                availableAmount: 0,
                withdrawnAmount: 0,
                contributorCount: 0,
                exists: true,
                createdAt: block.timestamp,
                lastUpdated: block.timestamp
            });
            totalBountiesCreated++;
        }
        
        bounties[_githubUsername].totalAmount += msg.value;
        bounties[_githubUsername].availableAmount += msg.value;
        bounties[_githubUsername].contributorCount++;
        bounties[_githubUsername].lastUpdated = block.timestamp;
        
        totalAmountLocked += msg.value;
        
        // Record the contribution
        bountyContributions[_githubUsername].push(Contribution({
            contributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            memo: _memo
        }));
        
        emit BountyAdded(_githubUsername, msg.sender, msg.value, block.timestamp, _memo);
    }
    
    /**
     * @dev Allow users to contribute to existing bounties
     * @param _githubUsername GitHub username to contribute bounty for
     * @param _memo Optional memo describing the contribution
     */
    function contributeToBounty(
        string memory _githubUsername,
        string memory _memo
    ) external payable validGithubUsername(_githubUsername) bountyExists(_githubUsername) {
        require(msg.value > 0, "Contribution amount must be greater than 0");
        
        bounties[_githubUsername].totalAmount += msg.value;
        bounties[_githubUsername].availableAmount += msg.value;
        bounties[_githubUsername].contributorCount++;
        bounties[_githubUsername].lastUpdated = block.timestamp;
        
        totalAmountLocked += msg.value;
        
        // Record the contribution
        bountyContributions[_githubUsername].push(Contribution({
            contributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            memo: _memo
        }));
        
        emit BountyAdded(_githubUsername, msg.sender, msg.value, block.timestamp, _memo);
    }
    
    /**
     * @dev Allow GitHub users to withdraw their bounties
     * @param _githubUsername GitHub username to withdraw bounty for
     */
    function withdrawBounty(string memory _githubUsername) 
        external 
        validGithubUsername(_githubUsername) 
        bountyExists(_githubUsername) 
    {
        address mappedAddress = githubToAddress[_githubUsername];
        require(mappedAddress != address(0), "GitHub username not mapped to any address");
        require(msg.sender == mappedAddress, "Only the mapped address can withdraw");
        
        uint256 availableAmount = bounties[_githubUsername].availableAmount;
        require(availableAmount > 0, "No funds available for withdrawal");
        
        bounties[_githubUsername].availableAmount = 0;
        bounties[_githubUsername].withdrawnAmount += availableAmount;
        bounties[_githubUsername].lastUpdated = block.timestamp;
        
        totalAmountLocked -= availableAmount;
        
        // Transfer the funds
        (bool success, ) = payable(mappedAddress).call{value: availableAmount}("");
        require(success, "Transfer failed");
        
        emit BountyWithdrawn(_githubUsername, mappedAddress, availableAmount, block.timestamp);
    }
    
    /**
     * @dev Emergency withdrawal by admin (with restrictions)
     * @param _githubUsername GitHub username
     * @param _reason Reason for emergency withdrawal
     */
    function emergencyWithdraw(
        string memory _githubUsername,
        string memory _reason
    ) external onlyAdmin bountyExists(_githubUsername) {
        require(bytes(_reason).length > 0, "Reason required for emergency withdrawal");
        
        uint256 availableAmount = bounties[_githubUsername].availableAmount;
        require(availableAmount > 0, "No funds available for withdrawal");
        
        bounties[_githubUsername].availableAmount = 0;
        bounties[_githubUsername].lastUpdated = block.timestamp;
        
        totalAmountLocked -= availableAmount;
        
        // Transfer to contract owner (should be multi-sig in production)
        (bool success, ) = payable(owner).call{value: availableAmount}("");
        require(success, "Transfer failed");
        
        emit BountyWithdrawn(_githubUsername, owner, availableAmount, block.timestamp);
    }
    
    /**
     * @dev Get bounty information for a GitHub username
     * @param _githubUsername GitHub username to query
     */
    function getBountyInfo(string memory _githubUsername) 
        external 
        view 
        returns (
            uint256 totalAmount,
            uint256 availableAmount,
            uint256 withdrawnAmount,
            uint256 contributorCount,
            address mappedAddress,
            uint256 createdAt,
            uint256 lastUpdated
        ) 
    {
        Bounty memory bounty = bounties[_githubUsername];
        return (
            bounty.totalAmount,
            bounty.availableAmount,
            bounty.withdrawnAmount,
            bounty.contributorCount,
            githubToAddress[_githubUsername],
            bounty.createdAt,
            bounty.lastUpdated
        );
    }
    
    /**
     * @dev Get contribution history for a GitHub username
     * @param _githubUsername GitHub username to query
     */
    function getContributionHistory(string memory _githubUsername) 
        external 
        view 
        returns (Contribution[] memory) 
    {
        return bountyContributions[_githubUsername];
    }
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() 
        external 
        view 
        returns (
            uint256 totalBounties,
            uint256 totalLocked,
            address contractOwner
        ) 
    {
        return (totalBountiesCreated, totalAmountLocked, owner);
    }
    
    /**
     * @dev Check if an address has admin privileges
     * @param _address Address to check
     */
    function isAdmin(address _address) external view returns (bool) {
        return admins[_address];
    }
    
    /**
     * @dev Fallback function to prevent accidental Ether sends
     */
    receive() external payable {
        revert("Direct payments not allowed. Use addBountyForUser or contributeToBounty");
    }
}