import jwt from 'jsonwebtoken'
const { MUX_SIGNING_KEY_ID, MUX_SIGNING_KEY_SECRET } = process.env

if (typeof MUX_SIGNING_KEY_ID !== "string") {
  throw new Error("Missing env: MUX_SIGNING_KEY_ID")
}

if (typeof MUX_SIGNING_KEY_SECRET !== "string") {
  throw new Error("Missing env: MUX_SIGNING_KEY_SECRET")
}

export function generateMuxVideoToken(playbackId: string | null) {
  if (playbackId) {
    const secretKey = Buffer.from(MUX_SIGNING_KEY_SECRET, 'base64').toString("ascii")
    const token = jwt.sign(
      {
        sub: playbackId,
        aud: "v",
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        kid: MUX_SIGNING_KEY_ID,
      },
      secretKey,
      { algorithm: "RS256" }, 
    )
    return token
  } else {
    return undefined
  }
}

export function generateMuxThumbnailToken(playbackId: string | null, fit: string | undefined = "crop") {
  if (playbackId) {
    const secretKey = Buffer.from(MUX_SIGNING_KEY_SECRET, 'base64').toString("ascii")
    const token = jwt.sign(
      {
        sub: playbackId,
        aud: "t",
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        kid: MUX_SIGNING_KEY_ID,
        height: "770",
        fit_mode: fit
      },
      secretKey,
      { algorithm: "RS256" }, 
    )
    return token
  } else {
    return undefined
  }
}
