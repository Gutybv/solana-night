import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { clusterApiUrl, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, Connection } from "@solana/web3.js";

export const GET = async (req: Request) => {
    const payload: ActionGetResponse = {
        icon: new URL("/image/eye.jpg", new URL(req.url).origin).toString(),
        label: "DONATE",
        description: "buy me a coffe",
        title: "Gilberts coffe donation"
    };

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });

}

export const OPTIONS = GET;

export const POST = async (req: Request) => {
    try {
        const body: ActionPostRequest = await req.json();

        let account: PublicKey;

        try {
            account = new PublicKey(body.account)
        } catch (error) {
            throw "Invalid 'account' provided";
        }

        const connection = new Connection(clusterApiUrl("devnet"));
        const PUB_KEY = new PublicKey("96UTCU5CtskDT2DYVVkMbKxRRDveSPPiB8jX1nrD1Pws")

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: account,
                lamports: 0.01 * LAMPORTS_PER_SOL,
                toPubkey: PUB_KEY,
            })
        )
        transaction.feePayer = account;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;


        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
                message: "Transaction created"
            }
        });

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
          });

    } catch (error) {
        let message = "Error processing request";
        if (typeof error === "string") {
            message = error;
        }

        return Response.json({ message: "" }, { headers: ACTIONS_CORS_HEADERS });
    }
}