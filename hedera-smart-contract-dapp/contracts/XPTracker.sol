// / contracts/IssueStaking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IssueStaking {
    struct Stake {
        string githubUsername;
        string repository;
        uint256 issueNumber;
        uint256 amount;
        uint256 timestamp;
        bool isActive;
    }
    
    struct UserStakes {
        uint256 totalStaked;
        uint256[] stakeIds;
    }
    
    mapping(uint256 => Stake) public stakes;
    mapping(string => UserStakes) public userStakes; // githubUsername => UserStakes
    mapping(string => mapping(uint256 => uint256)) public issueStakes; // repository => issueNumber => totalStaked
    
    uint256 public nextStakeId = 1;
    
    event StakeCreated(
        uint256 indexed stakeId,
        string indexed githubUsername,
        string repository,
        uint256 indexed issueNumber,
        uint256 amount,
        uint256 timestamp
    );
    
    event StakeWithdrawn(
        uint256 indexed stakeId,
        string indexed githubUsername,
        uint256 amount
    );
    
    function stakeOnIssue(
        string memory _githubUsername,
        string memory _repository,
        uint256 _issueNumber,
        uint256 _amount
    ) external payable {
        require(bytes(_githubUsername).length > 0, "GitHub username required");
        require(bytes(_repository).length > 0, "Repository required");
        require(_issueNumber > 0, "Valid issue number required");
        require(_amount > 0, "Stake amount must be greater than 0");
        require(msg.value == _amount, "Sent value must equal stake amount");
        
        uint256 stakeId = nextStakeId++;
        
        stakes[stakeId] = Stake({
            githubUsername: _githubUsername,
            repository: _repository,
            issueNumber: _issueNumber,
            amount: _amount,
            timestamp: block.timestamp,
            isActive: true
        });
        
        userStakes[_githubUsername].totalStaked += _amount;
        userStakes[_githubUsername].stakeIds.push(stakeId);
        
        string memory issueKey = string(abi.encodePacked(_repository, "-", _issueNumber));
        issueStakes[_repository][_issueNumber] += _amount;
        
        emit StakeCreated(
            stakeId,
            _githubUsername,
            _repository,
            _issueNumber,
            _amount,
            block.timestamp
        );
    }
    
    function getStake(uint256 _stakeId) external view returns (
        string memory githubUsername,
        string memory repository,
        uint256 issueNumber,
        uint256 amount,
        uint256 timestamp,
        bool isActive
    ) {
        Stake memory stake = stakes[_stakeId];
        return (
            stake.githubUsername,
            stake.repository,
            stake.issueNumber,
            stake.amount,
            stake.timestamp,
            stake.isActive
        );
    }
    
    function getUserTotalStaked(string memory _githubUsername) external view returns (uint256) {
        return userStakes[_githubUsername].totalStaked;
    }
    
    function getUserStakeIds(string memory _githubUsername) external view returns (uint256[] memory) {
        return userStakes[_githubUsername].stakeIds;
    }
    
    function getIssueStakeTotal(string memory _repository, uint256 _issueNumber) external view returns (uint256) {
        return issueStakes[_repository][_issueNumber];
    }
    
    function withdrawStake(uint256 _stakeId) external {
        Stake storage stake = stakes[_stakeId];
        require(stake.isActive, "Stake not active");
        require(stake.amount > 0, "No amount to withdraw");
        
        stake.isActive = false;
        userStakes[stake.githubUsername].totalStaked -= stake.amount;
        issueStakes[stake.repository][stake.issueNumber] -= stake.amount;
        
        payable(msg.sender).transfer(stake.amount);
        
        emit StakeWithdrawn(_stakeId, stake.githubUsername, stake.amount);
    }
}
