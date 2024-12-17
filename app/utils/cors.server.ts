export function cors(request: Request, response: Response): Response {
  // Development URLs for mobile apps
  const allowedOrigins = [
    'http://localhost:19006', // iOS Simulator
    'http://localhost:19000', // Expo development server
    'http://10.0.2.2:3000',  // Android Emulator
    // Add your production URLs here
  ];

  const origin = request.headers.get("Origin");
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}