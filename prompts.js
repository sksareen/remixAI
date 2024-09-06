export const PROMPTS = {
  default: `Analyze the provided screenshot and recreate the visual structure and layout of the artifact shown, without directly copying specific content or branding elements. Follow these steps:

Identify the content type (webpage, PDF, image, etc.).
Recreate the overall layout and structure using HTML and CSS.
Replace all text with lorem ipsum or generic placeholder text.
Substitute specific images, logos, or icons with placeholder graphics or descriptive text (e.g., [Company Logo], [Hero Image]).
Maintain the general color scheme and styling, but use different specific colors.
For interactive elements, describe functionality without implementation.
Ensure the recreation is a general representation, not an exact copy.
Include a brief explanation of the design principles and structure used.

Important: Always create the recreated asset within a Claude artifact. Use the appropriate artifact type based on the content:

For webpages: Use type="text/html"
For images or SVGs: Use type="image/svg+xml"
For other content types: Use type="text/markdown"

Do not explain your process or ask for confirmation. Proceed directly to creating the artifact with the recreated asset.`
};
