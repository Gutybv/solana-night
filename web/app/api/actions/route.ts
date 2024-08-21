import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS
}
  from "@solana/actions";

let secretWord = "APPLE";
let tries = [];

export async function GET(request: Request) {
  let statusMessage = "Adivina la palabra. Tienes 5 intentos.";

  if (tries.length >= 5) {
    statusMessage = "Juego terminado. La palabra era " + secretWord + ".";
  }

  const responseBody: ActionGetResponse = {
    icon: "https://solana.com/_next/static/media/logotype.e4df684f.svg",
    description: statusMessage,
    title: "Wordle en Solana",
    label: "click me",
    links: {
      actions: [
        {
          href: request.url,
          label: 'Intento 1'
        },
        {
          href: request.url,
          label: 'Intento 2'
        },
        {
          href: request.url,
          label: 'Intento 3'
        },
        {
          href: request.url,
          label: 'Intento 4'
        },
        {
          href: request.url,
          label: 'Intento 5',
          parameters: [
            {
              name: "word",
              label: "Introduce tu palabra",
              required: true
            }
          ]
        }
      ]
    },
    error: { message: "Este blink aún no está implementado." },
    type: "action"
  };
  const response = Response.json(responseBody, { headers: ACTIONS_CORS_HEADERS });

  return response;
}

interface MyActionData {
  word: string;
}

export async function POST(request: Request) {
  // Usamos la interfaz MyActionData para tipar correctamente la data
  const requestBody: ActionPostRequest<MyActionData> = await request.json();

  // Ahora podemos acceder a 'word' sin errores de tipado
  const userWord = (String(requestBody.data?.word || '')).toUpperCase()

  if (!userWord || userWord.length !== 5) {
    return Response.json({
      message: "La palabra debe tener 5 letras"
    }, { headers: ACTIONS_CORS_HEADERS });
  }

  // Procesar la palabra del usuario
  const result = Array(5).fill("incorrect");

  for (let i = 0; i < 5; i++) {
    if (userWord[i] === secretWord[i]) {
      result[i] = "correct";
    } else if (secretWord.includes(userWord[i])) {
      result[i] = "present";
    }
  }

  tries.push({ word: userWord, result });

  let message = "Resultado: " + result.join(", ");
  if (userWord === secretWord) {
    message = "¡Felicidades! Has adivinado la palabra.";
    tries = [];
  } else if (tries.length >= 5) {
    message = "Lo siento, no has adivinado la palabra. Era: " + secretWord;
    tries = [];
  }

  const response: ActionPostResponse = {
    transaction: '',  // Aquí deberías manejar la transacción según tu lógica
    message
  };

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}
