import {Box, Tab, TabList, TabPanel, TabPanels, Tabs} from "@chakra-ui/react";
import {PixelScreen} from "./tabs/PixelScreen";
import {TextMode} from "./tabs/TextMode";
import {Effects} from "./tabs/Effects";
import {PixelAnimations} from "./tabs/PixelAnimations";


export function TabsPage(props) {

  const pages = [
    {
      path: "/pixel",
      name: "Pixel Screen",
      element: <PixelScreen {...props} />
    },
    {
      path: "/animation",
      name: "Animation",
      element: <PixelAnimations {...props} />
    },
    {
      path: "/text",
      name: "Text",
      element: <TextMode {...props} />
    },
    {
      path: "/effects",
      name: "Effects",
      element: <Effects {...props} />
    }
  ].map((val, i) => ({...val, index: i}))


  return (
    <Box>
      <Tabs>
        <TabList>
          {
            pages.map(p =>
              <Tab key={p.path}>{p.name}</Tab>
            )
          }
        </TabList>
        <TabPanels>
          {
            pages.map(p =>
              <TabPanel key={p.path}>{p.element}</TabPanel>
            )
          }
          </TabPanels>
      </Tabs>
    </Box>
  );
}