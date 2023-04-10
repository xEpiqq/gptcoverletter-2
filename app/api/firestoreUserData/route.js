import { NextResponse } from 'next/server';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from '../../../components/FirebaseApp'
const db = getFirestore(app);

export async function POST(request) {
    const res = await request.json();
    const user_id = res.uid;

    console.log("user data")

    const userRef = doc(db, "users", user_id);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        return NextResponse.json(userDoc.data());
    } else {
        return NextResponse.json({error: "No such document!"});
    }

}