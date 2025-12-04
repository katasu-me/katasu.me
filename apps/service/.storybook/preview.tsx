import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div>
        <Story />
        {/* NOTE: Portal内にフォントを適用するため */}
        <style>
          {`
            body {
              font-family: "Reddit Sans", "IBM Plex Sans JP";
            }
          `}
        </style>
      </div>
    ),
  ],
};

export default preview;
