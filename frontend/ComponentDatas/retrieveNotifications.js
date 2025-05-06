const url = "http://localhost:8080/api/";
export async function getAllNotifs() {
    try {
        const userId = localStorage.getItem("id")
        // console.log(userId)
        const response = await fetch(`${url}data/followersNotifs?userId=${userId}`, {
            method: "GET",
            credentials: "include"
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}
export async function acceptFollow(updateType, incommingData) {
    try {
        const response = await fetch(`${url}data/updateFollower`, {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: JSON.stringify({
                type: updateType,
                status: 1,
                followId: incommingData.followerId,
                memberId: incommingData.addMemberId,
                groupId: incommingData.groupId,
                membershipId: incommingData.membershipId,
                groupIdMembership: incommingData.groupIdMembership
            })
        })
        const data = await response.json()
        console.log(data)
        if (response.status !== 200) {
            console.error("Failed to request to follow");
            return
        }
        
    } catch (error) {
        //console.log(error)
    }
}
export async function declineFollow(deleteType, incommingData) {
    try {
        const response = await fetch(`${url}data/deleteFollower`, {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: JSON.stringify({
                type : deleteType,
                status: 1,
                followId: incommingData.followerId,
                memberId: incommingData.addMemberId,
                groupId: incommingData.groupId,
                membershipId: incommingData.membershipId,
                groupIdMembership: incommingData.groupIdMembership
            })
        })
        if (response.status !== 200) {
            console.error("Failed to make the delete request");
            return
        }
    } catch (error) {
        //console.log(error)
    }
}
export async function getAddMemberNotifs() {
    try {
        const response = await fetch(`${url}data/addMembersNotifs`, {
            method: "GET",
            credentials: "include"
        });
        const data = await response.json();
        return data;
    } catch (error) {
        //console.log(error);
    }
}
export async function getRequestMembershipNotifs() {
    try {
        const response = await fetch(`${url}data/requestMembershipNotifs`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();
        return data;
    } catch (error) {
        //console.log(error);
    }
}
export async function getEventNotifs() {
    try {
        const response = await fetch(`${url}data/getEventNotifs`, {
            method: "GET",
            credentials: "include"
        });
        const data = await response.json();
        return data;
    } catch (error) {
       // console.log(error);
    }
}