import db from "../../../../utils/db";

export async function PUT(request) {
  const body = await request.json();
  const { user_uid, letter_title, letter_contents } = body;

  try {
    db.collection("users").doc(user_uid).collection("letters").add({
      title: letter_title,
      contents: letter_contents,
    });
    return new Response(JSON.stringify({}));
  } catch (e) {
    // console.log(e);
    console.log(e);
    return new Response(JSON.stringify({ error: "Something went wrong" }));
  }
}

export async function POST(request) {
  const body = await request.json();
  const { user_uid, letter_uid, letter_title, letter_contents } = body;

  try {
    const letterRef = db
      .collection("users")
      .doc(user_uid)
      .collection("letters")
      .doc(letter_uid);

    const letterDoc = await letterRef.get();

    if (!letterDoc.exists) {
      return new Response(JSON.stringify({ error: "Letter doesn't exist" }));
    } else {
      await letterRef.update( {
        title: letter_title,
        contents: letter_contents,
      });
      return new Response(JSON.stringify({}));
    }
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify({ error: "Something went wrong" }));
  }
}

export async function DELETE(request) {
  const body = await request.json();
  const { user_uid, letter_uid } = body;


  try {
    const letterRef = db
      .collection("users")
      .doc(user_uid)
      .collection("letters")
      .doc(letter_uid);

    const letterDoc = await letterRef.get();

    if (!letterDoc.exists) {
      return new Response(JSON.stringify({ error: "Letter doesn't exist" }));
    } else {
      await letterRef.delete();
      return new Response(JSON.stringify({}));
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Something went wrong" }));
  }
}

export async function GET(request) {
  const { user_uid, letter_uid } = request.body;

  try {
    const letterRef = db.doc("users", user_uid, "letters", letter_uid);
    const letterDoc = await getDoc(letterRef);

    if (!letterDoc.exists()) {
      return new Response(JSON.stringify({ error: "Letter doesn't exist" }));
    } else {
      return new Response(
        JSON.stringify({
          id: letterDoc.id,
          ...letterDoc.data(),
        })
      );
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Something went wrong" }));
  }
}
