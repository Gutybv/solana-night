import {
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  ActionPostRequest,
  createPostResponse,
  ActionPostResponse,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    icon: new URL("/image/tip.jpeg", new URL(req.url).origin).toString(),
    label: "Buy me a coffee",
    description:
      "Give a tip on SOL if you liked the content :)",
    title: "Tip Creator",
    links: {
      actions: [
        {
          href: "/api/actions/donate?amount=0.1",
          label: "0.01 SOL",
        },
        {
          href: "/api/actions/donate?amount=0.5",
          label: "0.05 SOL",
        },
        {
          href: "/api/actions/donate?amount=1.0",
          label: "0.1 SOL",
        },
      ],
    },
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);

    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      throw "Invalid 'account' provided. Its not a real pubkey";
    }

    let amount: number = 0.1;

    if (url.searchParams.has("amount")) {
      try {
        amount = parseFloat(url.searchParams.get("amount") || "0.1") || amount;
      } catch (err) {
        throw "Invalid 'amount' input";
      }
    }

    const connection = new Connection(clusterApiUrl("devnet"));

    const TO_PUBKEY = new PublicKey(
      "GZ7wDH9KDv7JsAj9zHtKcrKYUsxMMwo7Qkwe5z9nXN37",
    );

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: account,
        lamports: amount * LAMPORTS_PER_SOL,
        toPubkey: TO_PUBKEY,
      }),
    );
    transaction.feePayer = account;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: "Thanks for supporting :)",
      },
    });

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;

    return Response.json(
      {
        message,
      },
      {
        headers: ACTIONS_CORS_HEADERS,
      },
    );
  }
};