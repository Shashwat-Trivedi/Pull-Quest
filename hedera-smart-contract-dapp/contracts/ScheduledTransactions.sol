// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IGitHubIssueStaking {
    function getIssue(uint256 _issueId) external view returns (
        uint256 id,
        string memory githubIssueUrl,
        string memory title,
        string memory description,
        address creator,
        address assignee,
        uint256 stakeAmount,
        uint256 bountyAmount,
        uint256 totalEscrowed,
        uint8 status,
        uint256 createdAt,
        uint256 resolvedAt,
        string memory resolutionProof
    );
}

contract ScheduledTransactions {
    struct ScheduledTransfer {
        uint256 issueId;
        string githubUsername;
        address payable recipient;
        uint256 amount;
        uint256 executeAt;
        bool executed;
        address creator;
    }
    
    IGitHubIssueStaking public stakingContract;
    address public owner;
    uint256 public nextTransferId;
    
    mapping(uint256 => ScheduledTransfer) public scheduledTransfers;
    mapping(string => address) public githubToAddress;
    
    event TransferScheduled(
        uint256 indexed transferId,
        uint256 indexed issueId,
        string githubUsername,
        address recipient,
        uint256 amount,
        uint256 executeAt
    );
    
    event TransferExecuted(
        uint256 indexed transferId,
        address recipient,
        uint256 amount
    );
    
    event GithubAddressMapped(
        string githubUsername,
        address userAddress
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(address _stakingContract) {
        stakingContract = IGitHubIssueStaking(_stakingContract);
        owner = msg.sender;
        nextTransferId = 1;
    }
    
    function mapGithubToAddress(string memory _githubUsername, address _userAddress) external onlyOwner {
        githubToAddress[_githubUsername] = _userAddress;
        emit GithubAddressMapped(_githubUsername, _userAddress);
    }
    
    function scheduleTransfer(
        uint256 _issueId,
        string memory _githubUsername,
        uint256 _amount,
        uint256 _delayInSeconds
    ) external payable {
        require(msg.value == _amount, "Value must equal amount");
        require(githubToAddress[_githubUsername] != address(0), "Github user not mapped");
        
        uint256 transferId = nextTransferId++;
        
        scheduledTransfers[transferId] = ScheduledTransfer({
            issueId: _issueId,
            githubUsername: _githubUsername,
            recipient: payable(githubToAddress[_githubUsername]),
            amount: _amount,
            executeAt: block.timestamp + _delayInSeconds,
            executed: false,
            creator: msg.sender
        });
        
        emit TransferScheduled(
            transferId,
            _issueId,
            _githubUsername,
            githubToAddress[_githubUsername],
            _amount,
            block.timestamp + _delayInSeconds
        );
    }
    
    function executeTransfer(uint256 _transferId) external {
        ScheduledTransfer storage transfer = scheduledTransfers[_transferId];
        
        require(!transfer.executed, "Already executed");
        require(block.timestamp >= transfer.executeAt, "Not ready to execute");
        
        transfer.executed = true;
        transfer.recipient.transfer(transfer.amount);
        
        emit TransferExecuted(_transferId, transfer.recipient, transfer.amount);
    }
    
    function cancelTransfer(uint256 _transferId) external {
        ScheduledTransfer storage transfer = scheduledTransfers[_transferId];
        
        require(!transfer.executed, "Already executed");
        require(msg.sender == transfer.creator || msg.sender == owner, "Not authorized");
        
        transfer.executed = true;
        payable(transfer.creator).transfer(transfer.amount);
    }
    
    function getScheduledTransfer(uint256 _transferId) external view returns (
        uint256 issueId,
        string memory githubUsername,
        address recipient,
        uint256 amount,
        uint256 executeAt,
        bool executed
    ) {
        ScheduledTransfer storage transfer = scheduledTransfers[_transferId];
        return (
            transfer.issueId,
            transfer.githubUsername,
            transfer.recipient,
            transfer.amount,
            transfer.executeAt,
            transfer.executed
        );
    }
    
    function getGithubAddress(string memory _githubUsername) external view returns (address) {
        return githubToAddress[_githubUsername];
    }
    
    receive() external payable {}
}