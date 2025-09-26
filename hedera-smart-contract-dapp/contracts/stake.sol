// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract GitHubIssueStaking {
    struct Issue {
        uint256 id;
        string githubIssueUrl;
        string title;
        string description;
        address payable creator;
        address payable assignee;
        uint256 stakeAmount;      // Off-chain tracking only
        uint256 bountyAmount;     // Actual HBAR locked in contract
        uint256 totalEscrowed;    // Only bounty amount now
        IssueStatus status;
        uint256 createdAt;
        uint256 resolvedAt;
        string resolutionProof;
        address[] stakeholders;
        mapping(address => uint256) bountyContributions;
    }
    
    enum IssueStatus {
        Open,
        InProgress,
        UnderReview,
        Resolved,
        Disputed,
        Cancelled
    }
    
    // State variables
    uint256 public nextIssueId;
    mapping(uint256 => Issue) public issues;
    mapping(address => uint256[]) public userIssues;
    mapping(address => uint256[]) public userBountyContributions;
    
    address public owner;
    uint256 public platformFee;
    uint256 public constant MAX_FEE = 1000;
    
    // Events
    event IssueCreated(
        uint256 indexed issueId,
        address indexed creator,
        string githubIssueUrl,
        string title,
        uint256 stakeAmount,      // Off-chain reference
        uint256 bountyAmount,     // Actual HBAR
        uint256 totalEscrowed     // Only bounty
    );
    
    // <<< ADDED FOR LOGGING: Event to log input parameters during issue creation
    event LogIssueCreationAttempt(
        address indexed sender,
        uint256 stakeAmountFromInput,
        uint256 bountyAmountFromInput,
        uint256 valueSentWithTx,
        string githubUrl
    );

    // <<< ADDED FOR LOGGING: Event to log input parameters when adding a bounty
    event LogBountyAddAttempt(
        address indexed sender,
        uint256 indexed issueId,
        uint256 valueSentWithTx
    );

    event BountyAdded(
        uint256 indexed issueId,
        address indexed contributor,
        uint256 amount,
        uint256 totalBounty
    );
    
    event IssueAssigned(
        uint256 indexed issueId,
        address indexed assignee
    );
    
    event IssueStatusChanged(
        uint256 indexed issueId,
        IssueStatus oldStatus,
        IssueStatus newStatus
    );
    
    event IssueResolved(
        uint256 indexed issueId,
        address indexed resolver,
        string resolutionProof,
        uint256 bountyPayout,
        uint256 stakeReturned
    );
    
    event BountyWithdrawn(
        uint256 indexed issueId,
        address indexed contributor,
        uint256 amount
    );
    
    event StakeReturned(
        uint256 indexed issueId,
        address indexed creator,
        uint256 amount
    );
    
    event DisputeRaised(
        uint256 indexed issueId,
        address indexed disputer
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyIssueCreator(uint256 _issueId) {
        require(issues[_issueId].creator == msg.sender, "Only issue creator can call this");
        _;
    }
    
    modifier onlyAssignee(uint256 _issueId) {
        require(issues[_issueId].assignee == msg.sender, "Only assignee can call this");
        _;
    }
    
    modifier issueExists(uint256 _issueId) {
        require(_issueId < nextIssueId, "Issue does not exist");
        _;
    }
    
    modifier issueInStatus(uint256 _issueId, IssueStatus _status) {
        require(issues[_issueId].status == _status, "Issue not in required status");
        _;
    }
    
    // Constructor
    constructor(uint256 _platformFee) {
        require(_platformFee <= MAX_FEE, "Platform fee too high");
        owner = msg.sender;
        platformFee = _platformFee;
        nextIssueId = 1;
    }
    

    function createIssueWithBounty(
        string memory _githubIssueUrl,
        string memory _title,
        string memory _description,
        uint256 _stakeAmount,     // Off-chain tracking only
        uint256 _bountyAmount     // Must equal msg.value
    ) external payable {
        // <<< ADDED FOR LOGGING: Emit event with all inputs from the frontend
        emit LogIssueCreationAttempt(
            msg.sender,
            _stakeAmount,
            _bountyAmount,
            msg.value,
            _githubIssueUrl
        );

        require(_bountyAmount > 0, "Bounty amount must be greater than 0");
        require(msg.value == _bountyAmount, "Sent value must equal bounty amount");
        require(bytes(_githubIssueUrl).length > 0, "GitHub URL required");
        require(bytes(_title).length > 0, "Title required");
        
        uint256 issueId = nextIssueId++;
        Issue storage newIssue = issues[issueId];
        
        newIssue.id = issueId;
        newIssue.githubIssueUrl = _githubIssueUrl;
        newIssue.title = _title;
        newIssue.description = _description;
        newIssue.creator = payable(msg.sender);
        newIssue.stakeAmount = _stakeAmount;    // Off-chain tracking
        newIssue.bountyAmount = _bountyAmount;  // Actual HBAR
        newIssue.totalEscrowed = _bountyAmount; // Only bounty
        newIssue.status = IssueStatus.Open;
        newIssue.createdAt = block.timestamp;
        
        // Add creator as first bounty contributor
        newIssue.stakeholders.push(msg.sender);
        newIssue.bountyContributions[msg.sender] = _bountyAmount;
        
        // Update user mappings
        userIssues[msg.sender].push(issueId);
        userBountyContributions[msg.sender].push(issueId);
        
        emit IssueCreated(
            issueId, 
            msg.sender, 
            _githubIssueUrl, 
            _title, 
            _stakeAmount,     // Off-chain reference
            _bountyAmount,    // Actual HBAR
            _bountyAmount     // Only bounty escrowed
        );
    }
    
    /**
     * @dev Add additional bounty to an existing issue
     */
    function addBounty(uint256 _issueId) 
        external 
        payable 
        issueExists(_issueId) 
        issueInStatus(_issueId, IssueStatus.Open) 
    {
        // <<< ADDED FOR LOGGING: Emit event showing who is adding how much
        emit LogBountyAddAttempt(msg.sender, _issueId, msg.value);
        
        require(msg.value > 0, "Must add some bounty amount");
        
        Issue storage issue = issues[_issueId];
        
        if (issue.bountyContributions[msg.sender] == 0) {
            issue.stakeholders.push(msg.sender);
            userBountyContributions[msg.sender].push(_issueId);
        }
        
        issue.bountyContributions[msg.sender] += msg.value;
        issue.bountyAmount += msg.value;
        issue.totalEscrowed += msg.value;
        
        emit BountyAdded(_issueId, msg.sender, msg.value, issue.bountyAmount);
    }
    
    function assignIssue(uint256 _issueId, address _assignee) 
        external 
        issueExists(_issueId) 
        onlyIssueCreator(_issueId) 
        issueInStatus(_issueId, IssueStatus.Open) 
    {
        require(_assignee != address(0), "Invalid assignee address");
        
        Issue storage issue = issues[_issueId];
        issue.assignee = payable(_assignee);
        
        _changeIssueStatus(_issueId, IssueStatus.InProgress);
        
        emit IssueAssigned(_issueId, _assignee);
    }
    
    function submitResolution(uint256 _issueId, string memory _resolutionProof) 
        external 
        issueExists(_issueId) 
        onlyAssignee(_issueId) 
        issueInStatus(_issueId, IssueStatus.InProgress) 
    {
        require(bytes(_resolutionProof).length > 0, "Resolution proof required");
        
        Issue storage issue = issues[_issueId];
        issue.resolutionProof = _resolutionProof;
        
        _changeIssueStatus(_issueId, IssueStatus.UnderReview);
    }
    
    function approveResolution(uint256 _issueId) 
        external 
        issueExists(_issueId) 
        onlyIssueCreator(_issueId) 
        issueInStatus(_issueId, IssueStatus.UnderReview) 
    {
        Issue storage issue = issues[_issueId];
        
        _changeIssueStatus(_issueId, IssueStatus.Resolved);
        issue.resolvedAt = block.timestamp;
        
        _distributeBountyOnly(_issueId); // Changed function name
        
        emit IssueResolved(
            _issueId, 
            issue.assignee, 
            issue.resolutionProof, 
            issue.bountyAmount,
            0 // No stake returned since it was off-chain
        );
    }
    
    function raiseDispute(uint256 _issueId) 
        external 
        issueExists(_issueId) 
        issueInStatus(_issueId, IssueStatus.UnderReview) 
    {
        Issue storage issue = issues[_issueId];
        require(
            issue.bountyContributions[msg.sender] > 0 || issue.creator == msg.sender, 
            "Only stakeholders or creator can raise disputes"
        );
        
        _changeIssueStatus(_issueId, IssueStatus.Disputed);
        
        emit DisputeRaised(_issueId, msg.sender);
    }
    
    function resolveDispute(uint256 _issueId, bool _approveResolution) 
        external 
        onlyOwner 
        issueExists(_issueId) 
        issueInStatus(_issueId, IssueStatus.Disputed) 
    {
        if (_approveResolution) {
            Issue storage issue = issues[_issueId];
            _changeIssueStatus(_issueId, IssueStatus.Resolved);
            issue.resolvedAt = block.timestamp;
            _distributeBountyOnly(_issueId);
            emit IssueResolved(
                _issueId, 
                issue.assignee, 
                issue.resolutionProof, 
                issue.bountyAmount,
                0
            );
        } else {
            _changeIssueStatus(_issueId, IssueStatus.InProgress);
        }
    }
    
    function cancelIssue(uint256 _issueId) 
        external 
        issueExists(_issueId) 
        onlyIssueCreator(_issueId) 
    {
        require(
            issues[_issueId].status == IssueStatus.Open || 
            issues[_issueId].status == IssueStatus.InProgress,
            "Cannot cancel issue in current status"
        );
        
        _changeIssueStatus(_issueId, IssueStatus.Cancelled);
        _refundBountiesOnly(_issueId); // Changed function name
    }
    
    function withdrawBountyContribution(uint256 _issueId) 
        external 
        issueExists(_issueId) 
        issueInStatus(_issueId, IssueStatus.Cancelled) 
    {
        Issue storage issue = issues[_issueId];
        uint256 contributionAmount = issue.bountyContributions[msg.sender];
        
        require(contributionAmount > 0, "No bounty contribution to withdraw");
        
        issue.bountyContributions[msg.sender] = 0;
        payable(msg.sender).transfer(contributionAmount);
        
        emit BountyWithdrawn(_issueId, msg.sender, contributionAmount);
    }
    
    // Removed withdrawStake function since stake is off-chain
    
    /**
     * @dev Internal function to distribute bounty only
     */
    function _distributeBountyOnly(uint256 _issueId) internal {
        Issue storage issue = issues[_issueId];
        uint256 bountyAmount = issue.bountyAmount;
        
        // Calculate platform fee on bounty only
        uint256 feeAmount = (bountyAmount * platformFee) / 10000;
        uint256 bountyPayout = bountyAmount - feeAmount;
        
        // Transfer bounty payout to assignee
        if (bountyPayout > 0) {
            issue.assignee.transfer(bountyPayout);
        }
        
        // Transfer fee to owner
        if (feeAmount > 0) {
            payable(owner).transfer(feeAmount);
        }
        
        // Reset amounts
        issue.bountyAmount = 0;
        issue.totalEscrowed = 0;
    }
    
    /**
     * @dev Internal function to refund bounty contributions only
     */
    function _refundBountiesOnly(uint256 _issueId) internal {
        Issue storage issue = issues[_issueId];
        
        // Refund bounty contributions
        for (uint256 i = 0; i < issue.stakeholders.length; i++) {
            address stakeholder = issue.stakeholders[i];
            uint256 contributionAmount = issue.bountyContributions[stakeholder];
            
            if (contributionAmount > 0) {
                issue.bountyContributions[stakeholder] = 0;
                payable(stakeholder).transfer(contributionAmount);
                emit BountyWithdrawn(_issueId, stakeholder, contributionAmount);
            }
        }
        
        issue.bountyAmount = 0;
        issue.totalEscrowed = 0;
    }
    
    function _changeIssueStatus(uint256 _issueId, IssueStatus _newStatus) internal {
        IssueStatus oldStatus = issues[_issueId].status;
        issues[_issueId].status = _newStatus;
        
        emit IssueStatusChanged(_issueId, oldStatus, _newStatus);
    }
    
    // View functions
    
    function getIssue(uint256 _issueId) 
        external 
        view 
        issueExists(_issueId) 
        returns (
            uint256 id,
            string memory githubIssueUrl,
            string memory title,
            string memory description,
            address creator,
            address assignee,
            uint256 stakeAmount,
            uint256 bountyAmount,
            uint256 totalEscrowed,
            IssueStatus status,
            uint256 createdAt,
            uint256 resolvedAt,
            string memory resolutionProof
        ) 
    {
        Issue storage issue = issues[_issueId];
        return (
            issue.id,
            issue.githubIssueUrl,
            issue.title,
            issue.description,
            issue.creator,
            issue.assignee,
            issue.stakeAmount,
            issue.bountyAmount,
            issue.totalEscrowed,
            issue.status,
            issue.createdAt,
            issue.resolvedAt,
            issue.resolutionProof
        );
    }
    
    function getUserBountyContribution(uint256 _issueId, address _user) 
        external 
        view 
        issueExists(_issueId) 
        returns (uint256) 
    {
        return issues[_issueId].bountyContributions[_user];
    }
    
    function getIssueStakeholders(uint256 _issueId) 
        external 
        view 
        issueExists(_issueId) 
        returns (address[] memory) 
    {
        return issues[_issueId].stakeholders;
    }
    
    function getUserIssues(address _user) external view returns (uint256[] memory) {
        return userIssues[_user];
    }
    
    function getUserBountyContributions(address _user) external view returns (uint256[] memory) {
        return userBountyContributions[_user];
    }
    
    // Owner functions
    
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "Fee too high");
        platformFee = _newFee;
    }
    
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
    
    // Fallback functions
    receive() external payable {}
    fallback() external payable {}
}