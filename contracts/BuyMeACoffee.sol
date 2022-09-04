// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

// Deployed to 0x1427484F42EacC54A06b64C8608fB3E89595b99F
// Explore: https://goerli.etherscan.io/address/0x1427484F42EacC54A06b64C8608fB3E89595b99F

contract BuyMeACoffee {
    // Event to emit when a Memo is created
    event NewMemo(
        address indexed from,
        uint256 timestamps,
        string name,
        string message
    );

    // Memo struct
    struct Memo {
        address from;
        uint256 timestamps;
        string name;
        string message;
    }

    // List of memos received from friends
    Memo[] memos;

    // Address of constract deployer
    address payable owner;

    // deploy logic
    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * @dev Buy a coffe for contract owner
     * @param _name name of the coffe buyer
     * @param _message a nice message from coffee buyer
     */
    function buyCoffee(string memory _name, string memory _message)
        public
        payable
    {
        require(msg.value > 0, "can't buy a coffe with 0 eth");

        // Add the memo to storage
        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        // Emit a log event when a new memo is created
        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    /**
     * @dev send the entire balance stored in this contract to a owner
     */
    function withdrawTips() public {
        require(owner.send(address(this).balance));
    }

    /**
     * @dev retrieve all the memos received and stored on the blockchain
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }
}
