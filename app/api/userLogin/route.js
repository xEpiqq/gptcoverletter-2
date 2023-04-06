import db from "../../../utils/db";

export async function POST(request) {

    const body = await request.json();
    const { user_id, displayname, email } = body;

    try {
        // get the user document
        const userRef = db.collection("users").doc(user_id);
        const userDoc = await userRef.get();

        // if the user document exists, return
        if (userDoc.exists) {
            console.log("User document already exists");
            return new Response(JSON.stringify({}));
        } else {
            // if the user document does not exist, create it
            await userRef.set({
                name: displayname,
                email: email,
                sub: "none",
            });
            console.log("User document created");
        }
    } catch (e) {
        console.log(e);
        return new Response(JSON.stringify({ error: "Something went wrong" }));
    }
}
