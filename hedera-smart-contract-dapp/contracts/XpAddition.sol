// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PRXpTracker {
    struct UserXP {
        string githubUsername;
        uint256 prNumber;
        uint256 xpPoints;
        uint256 timestamp;
    }
    
    mapping(string => uint256) public userTotalXP; // githubUsername => total XP points
    mapping(string => UserXP[]) public userXPLogs; // githubUsername => array of XP logs
    
    event XpAdded(
        string indexed githubUsername,
        uint256 indexed prNumber,
        uint256 xpPoints,
        uint256 timestamp,
        string message
    );
    
    /**
     * @notice Adds XP points for a user for a specific PR with optional message
     * @param _githubUsername GitHub username of the user
     * @param _prNumber PR number on which XP is awarded
     * @param _xpPoints Number of XP points to add
     * @param _message Optional message describing the XP award reason
     */
    function addXp(
        string memory _githubUsername,
        uint256 _prNumber,
        uint256 _xpPoints,
        string memory _message
    ) external {
        require(bytes(_githubUsername).length > 0, "GitHub username required");
        require(_prNumber > 0, "Valid PR number required");
        require(_xpPoints > 0, "XP points must be greater than 0");
        
        // Create new XP log entry
        UserXP memory newXp = UserXP({
            githubUsername: _githubUsername,
            prNumber: _prNumber,
            xpPoints: _xpPoints,
            timestamp: block.timestamp
        });
        
        userXPLogs[_githubUsername].push(newXp);
        userTotalXP[_githubUsername] += _xpPoints;
        
        emit XpAdded(
            _githubUsername,
            _prNumber,
            _xpPoints,
            block.timestamp,
            _message
        );
    }
    
    /**
     * @notice Get total XP points accumulated by a user
     * @param _githubUsername GitHub username
     * @return Total XP points
     */
    function getUserTotalXp(string memory _githubUsername) external view returns (uint256) {
        return userTotalXP[_githubUsername];
    }
    
    /**
     * @notice Get all XP logs for a user
     * @param _githubUsername GitHub username
     * @return Array of UserXP structs
     */
    function getUserXpLogs(string memory _githubUsername) external view returns (UserXP[] memory) {
        return userXPLogs[_githubUsername];
    }
}
