# RektChart Component Documentation

## Overview

The `RektChart` component is a React functional component built with TypeScript. It leverages the `lightweight-charts` library to render an interactive candlestick chart with additional features such as Volume Weighted Average Price (VWAP) lines, real-time data updates via WebSockets, and customizable markers. The component is designed to display market data, handle user interactions for adding VWAPs, and manage the state of various UI elements.

## File Path

`src/app/components/RektChart.tsx`

## Props

### `RektChartProps`

The component accepts the following props:

| Prop Name                | Type                              | Description                                                                   |
| ------------------------ | --------------------------------- | ----------------------------------------------------------------------------- |
| `parentContainerRef`     | `React.RefObject<HTMLDivElement>` | Reference to the parent container element for responsive chart sizing.        |
| `sidebarOpen`            | `boolean`                         | Indicates whether the sidebar is open, affecting chart resizing.              |
| `filters`                | `Filters`                         | Contains filter settings such as symbol, interval, and marker counts.         |
| `pastRektMarkersLoading` | `boolean`                         | Indicates if past Rekt markers are currently loading.                         |
| `pastRektMarkersError`   | `string \| null`                  | Error message related to loading past Rekt markers, if any.                   |
| `rektWsStatus`           | `string`                          | Status of the Rekt WebSocket connection (`connected`, `connecting`, `error`). |
| `rektMarkers`            | `MarkerData[]`                    | Array of markers to be displayed on the chart.                                |

## State Variables

| State Variable    | Type                | Description                                                             |
| ----------------- | ------------------- | ----------------------------------------------------------------------- |
| `isLoading`       | `boolean`           | Indicates if the chart is in a loading state.                           |
| `isError`         | `string`            | Stores any error messages related to data fetching or WebSocket status. |
| `updatedData`     | `CandlestickData[]` | Holds the latest market data for rendering the candlestick series.      |
| `isAddingVWAP`    | `boolean`           | Flags whether the user is in the process of adding a new VWAP line.     |
| `anchoredVWAPs`   | `AnchoredVWAP[]`    | Array of VWAP lines that have been added to the chart.                  |
| `colorPickerVWAP` | `string \| null`    | ID of the VWAP currently being edited for color changes.                |
| `tempColor`       | `string`            | Temporary color value for editing a VWAP line.                          |
| `tempLineWidth`   | `number`            | Temporary line width value for editing a VWAP line.                     |

## Refs

| Ref Name               | Type                                                        | Description                                            |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| `chartContainerRef`    | `React.RefObject<HTMLDivElement>`                           | Reference to the chart container DOM element.          |
| `chartRef`             | `React.MutableRefObject<IChartApi \| null>`                 | Reference to the Lightweight Charts API instance.      |
| `candlestickSeriesRef` | `React.MutableRefObject<ISeriesApi<'Candlestick'> \| null>` | Reference to the candlestick series in the chart.      |
| `volumeSeriesRef`      | `React.MutableRefObject<ISeriesApi<'Histogram'> \| null>`   | Reference to the volume histogram series in the chart. |

## Hooks Used

- **`useMarketData`**: Fetches market data based on the provided symbol and interval.
- **`useWebSocket`**: Establishes a WebSocket connection to receive real-time Kline data.
- **`useEffect`**: Manages side effects such as chart initialization, data updates, and event listeners.
- **`useState`**: Manages local state within the component.
- **`useCallback`**: Memoizes callback functions to prevent unnecessary re-renders.

## Key Functions

### `getIntervalStartTime(time: number, interval: string): number`

Calculates the start time of the given interval based on the provided timestamp.

### `handleChartClick(param: MouseEventParams)`

Handles click events on the chart to add new VWAP lines when `isAddingVWAP` is true.

### `handleAddVWAP()`

Enters the VWAP adding mode, allowing the user to click on the chart to place a VWAP line.

### `handleDeleteVWAP(id: string)`

Removes a specific VWAP line from the chart based on its ID.

### `handleColorChange(color: { hex: string })`

Updates the temporary color state when the user selects a new color for a VWAP line.

### `handleLineWidthChange(event: React.ChangeEvent<HTMLInputElement>)`

Updates the temporary line width state based on user input.

### `handleVWAPStyleChangeComplete(id: string)`

Applies the temporary color and line width changes to a specific VWAP line and resets the temporary states.

### `handleAddTop5VWAPs()`

Adds VWAP lines for the top 5 liquidation markers, ensuring no duplicates are added.

## Effect Hooks

### Chart Initialization and Cleanup

Initializes the Lightweight Chart with specified options and handles resizing based on the parent container. Cleans up by removing event listeners and the chart instance on component unmount.

### Data Handling

Updates the candlestick and volume series when new market data is fetched. Ensures that data is properly formatted and displayed.

### WebSocket Status Management

Monitors the status of the WebSocket connections and updates the loading and error states accordingly.

### VWAP Updates

Automatically updates VWAP lines when new Kline data is received, ensuring that VWAPs reflect the latest market data.

### Crosshair and Tooltip Management

Handles the display and positioning of tooltips when hovering over markers on the chart.

### Keyboard Event Handling

Allows users to exit VWAP adding mode by pressing the `Escape` key.

## UI Components

### VWAP Controls

Provides buttons to add a new VWAP line or add the top 5 liquidation VWAPs. Displays a list of added VWAPs with options to edit or delete each line.

### Chart Container

Renders the candlestick chart and overlays loading indicators or error messages based on the current state.

### Status Indicators

Displays the status of the WebSocket connections for both KLine data and Rekt WebSocket, using icons and color coding to indicate connected, connecting, or error states.

## Styling

Uses Tailwind CSS classes for styling various UI elements, ensuring a responsive and visually consistent interface. The chart container adjusts its cursor style based on whether the user is adding a VWAP line.

## Dependencies

- **React & React Hooks**: For building the component and managing state.
- **lightweight-charts**: For rendering the interactive candlestick chart.
- **react-icons**: For displaying icons within the UI.
- **uuid**: For generating unique IDs for VWAP lines.
- **react-spinners**: For displaying loading indicators.
- **react-color**: For the color picker in the VWAP style editor.
- **use-sound**: Potentially for adding sound notifications (though not explicitly used in the provided code).
- **Other Utility Hooks and Components**: Such as `usePastRektsData`, `useMarketData`, `useWebSocket`, `SettingsCard`, and various UI components like `Button`, `Popover`, `Input`, and `Label`.

## Interaction with Other Files

- **`usePastRektsData`**: Parses interval data for the chart.
- **`useMarketData`**: Fetches market data for the specified symbol and interval.
- **`useWebSocket`**: Manages WebSocket connections for real-time data updates.
- **`helper.ts`**: Provides utility functions like `calculateVWAPSeriesData` and `formatCurrency`.
- **UI Components**: Utilizes shared UI components such as `Card`, `Button`, `Popover`, `Input`, and `Label` for consistent styling and functionality across the application.

## Error Handling

- Displays error messages overlaying the chart if there are issues with data fetching or WebSocket connections.
- Manages error states through the `isError` state variable, which is updated based on WebSocket statuses and data fetching results.

## Loading States

- Shows a loading spinner overlay when data is being fetched or WebSocket connections are in the process of establishing.
- The loading state is managed through the `isLoading` state variable, which depends on multiple factors including market data loading, WebSocket statuses, and the presence of data.

## Customization

- **VWAP Lines**: Users can add, edit (color and line width), and delete VWAP lines. Styles can be customized through a color picker and line width input.
- **Markers**: Displays markers with tooltips showing detailed information like liquidation value, price, and timestamp. Markers can be filtered based on user-defined settings.
- **Responsive Design**: The chart resizes dynamically based on the parent container's dimensions and the state of the sidebar.

## Accessibility

- Provides keyboard accessibility by allowing users to cancel adding a VWAP line with the `Escape` key.
- Uses semantic HTML elements and ARIA roles within tooltips and interactive components for better accessibility support.

## Conclusion

The `RektChart` component is a comprehensive charting solution tailored for displaying financial data with advanced features like real-time updates, interactive VWAP management, and customizable markers. Its modular design and integration with various hooks and utility functions make it a robust component within the larger application.

## Additional Notes

- **Imported Files Changes**: Based on the current context, there are no immediate indications that imported files require changes. However, any updates to utility functions like `calculateVWAPSeriesData` in `helper.ts` or the hooks in `usePastRektsData.ts` might necessitate corresponding adjustments in this component.

## Related Files

- `src/app/components/RektDashboard.tsx`
- `src/app/utils/helper.ts`
- `src/app/api/pastRekts.ts`
- `src/app/api/marketData.ts`
- `src/app/components/MarkerListCard.tsx`
- `src/app/components/NavBar.tsx`
- `src/app/components/Header.tsx`
- `src/app/hooks/usePastRektsData.ts`
- `node_modules/@types/react/index.d.ts`

Please ensure that these files are consistent with the changes and integrations within the `RektChart` component.

# Conclusion

The documentation above provides a comprehensive overview of the `RektChart` component, detailing its structure, functionality, and interactions within the application. This should aid in understanding, maintaining, and extending the component as needed.
