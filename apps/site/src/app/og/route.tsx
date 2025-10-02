import { ImageResponse } from "next/og";

export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 64,
                    background: "linear-gradient(to right, #0f172a, #1e293b)",
                    color: "white",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                🚀 Repo
            </div>
        ),
        size
    );
}
