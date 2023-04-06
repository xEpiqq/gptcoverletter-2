import db from "../../../../utils/db";

export async function GET(request) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    const entries = await db
      .collection("users")
      .doc(id)
      .collection("letters")
      .get();

    if (entries.empty) {
      return new Response(JSON.stringify([...DEFUALT_DATA]));
    }

    const entriesData = entries.docs.map((entry) => ({
      id: entry.id,
      ...entry.data(),
    }));
    return new Response(JSON.stringify([...entriesData]));
  } catch (e) {
    console.log(e);
    return new Response(
      JSON.stringify({ error: "Something went wrong" })
    );
  }
}

const DEFUALT_DATA = [
  {
    title: "Letter 1",
    id: "feajiojdklp",
  },
];
