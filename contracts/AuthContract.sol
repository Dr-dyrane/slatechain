// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AuthContract {
    struct User {
        string userId;
        uint256 registeredAt;
        bool exists;
    }
    
    // Mapping from user address to user data
    mapping(address => User) private users;
    
    // Event emitted when a new user is registered
    event UserRegistered(address indexed userAddress, string userId, uint256 timestamp);
    
    // Register a new user
    function registerUser(address userAddress, string memory userId) public {
        require(!users[userAddress].exists, "User already registered");
        require(bytes(userId).length > 0, "User ID cannot be empty");
        
        users[userAddress] = User({
            userId: userId,
            registeredAt: block.timestamp,
            exists: true
        });
        
        emit UserRegistered(userAddress, userId, block.timestamp);
    }
    
    // Check if a user exists
    function userExists(address userAddress) public view returns (bool) {
        return users[userAddress].exists;
    }
    
    // Get user ID
    function getUserId(address userAddress) public view returns (string memory) {
        require(users[userAddress].exists, "User does not exist");
        return users[userAddress].userId;
    }
    
    // Get user registration timestamp
    function getUserRegistrationTime(address userAddress) public view returns (uint256) {
        require(users[userAddress].exists, "User does not exist");
        return users[userAddress].registeredAt;
    }
}

