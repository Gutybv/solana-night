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

// GET Request - Show Lottery Details
export const GET = async (req: Request) => {
    const payload: ActionGetResponse = {
        icon: new URL("/image/tip.jpeg", new URL(req.url).origin).toString(),
        label: "Tip",
        description: "Support the creator if you like the content! ",
        title: "Tip Creator",
        links: {
            actions: [
                {
                    href: "/api/actions/tipping?amount=0.1",
                    label: "Tip 0.01 SOL",
                },       
                {
                    href: "/api/actions/tipping?amount=0.5",
                    label: "Tip 0.05 SOL",
                },  
                {
                    href: "/api/actions/tipping?amount=0.1",
                    label: "Tip 0.1 SOL",
                },   
            ],
        },
        type: "action"
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
            throw "Invalid 'account' provided. It's not a real pubkey.";
        }

        let ticketCount: number = 1;
        const ticketPrice = 0.01;
        if (url.searchParams.has("amount")) {
            try {
                ticketCount = parseInt(url.searchParams.get("amount") || "1") || 1;
            } catch (err) {
                throw "Invalid 'amount' input";
            }
        }

        const totalAmount = ticketPrice * ticketCount;

        const connection = new Connection(clusterApiUrl("mainnet-beta"));
        const TO_PUBKEY = new PublicKey("GZ7wDH9KDv7JsAj9zHtKcrKYUsxMMwo7Qkwe5z9nXN37");

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: account,
                lamports: totalAmount * LAMPORTS_PER_SOL,
                toPubkey: TO_PUBKEY,
            }),
        );

        transaction.feePayer = account;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
                message: `Thanks for supporting :)!`,
            },
        });

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        });
    } catch (err) {
        let message = "An unknown error occurred";
        if (typeof err == "string") message = err;
        if (err instanceof Error) message = err.message;

        console.error("Error details:", err);  // Log the detailed error

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
