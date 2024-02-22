import {Box, Tab, TabList, Tabs} from "@chakra-ui/react";
import {Route, Routes, useNavigate} from "react-router-dom";
import {PixelScreen} from "./tabs/PixelScreen";
import {TextMode} from "./tabs/TextMode";
import {Effects} from "./tabs/Effects";
import {PixelAnimations} from "./tabs/PixelAnimations";


export function TabsPage(props) {

  let navigate = useNavigate();

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
  ]

  return (
    <Box>
      <Tabs>
        <TabList>
          {
            pages.map(p =>
              <Tab onClick={() => navigate(p.path)} key={p.path}>{p.name}</Tab>
            )
          }
        </TabList>
      </Tabs>
      <Box mt={4} p={2}>
        <Routes>
          {
            pages.map(p => <Route {...p} key={p.path}/>)
          }
        </Routes>
      </Box>
    </Box>
  );
}