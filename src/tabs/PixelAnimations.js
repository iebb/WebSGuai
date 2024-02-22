import {useEffect, useState} from "react";
import {Box, Center, Heading, Text, Input, SimpleGrid, Textarea} from "@chakra-ui/react";
import {decodeBitmap, encodeBitmap} from "./images";

const defaultImage = "AAAAAAAAAAAAAAAAAAAAAAAVAAAAAAAVAAAAAAAXACJknJORADKVIqRRACrmIsRAACaFIqRAACJ0nJOAAAAAAAAAAAAAAAAA";

const pixelSize = 6;
const marginSize = 0;
const pixelSizeWithMargin = pixelSize + 2 * marginSize;



export function PixelAnimations() {
  const [mouseDown, setMouseDown] = useState(false);
  const [images, setImages] = useState([defaultImage, defaultImage, defaultImage]);
  const [invalidInput, setInvalidInput] = useState(false);
  const [encoded, setEncoded] = useState(false);

  const { SGuai } = window;

  useEffect(() => {
    let images = [defaultImage, defaultImage, defaultImage];
    try {
      let localAnim = localStorage.animation.split("\n");
      if (localAnim) {
        images = localAnim;
      }
    } catch {

    }
    play(images);
  }, [SGuai]);

  const play = async (images) => {
    setImages(images);
    for(let i = 0; i < images.length; i++) {
      await SGuai.send(0x26, [i, 255, ...decodeBitmap(images[i])]);
    }
    await SGuai.send(0x26, [images.length]);
    localStorage.animation = images.join("\n");
    setEncoded(images.join("\n"));
  }

  return (
    <div>
      <Box mt={4}>
        <Heading as='h4' size='md' my={4}>Pixel Animations</Heading>
        <SimpleGrid columns={3} spacing={10}>
        {
          images.map((im, _idx) => {
            const image = decodeBitmap(im);
            return (
              <Box
                key={_idx}
                my={2}
              >
                <Box>
                  <Text>Frame {_idx}</Text>
                  <Box
                    style={{ overflowX: "auto" }}
                  >
                    <div
                      style={{ minWidth: 48 * pixelSizeWithMargin }}
                      onMouseDown={() => setMouseDown(true)}
                      onMouseUp={() => setMouseDown(false)}
                    >
                      {
                        Array.from(Array(12)).map((x, i) => (
                          <div key={i} style={{ height: pixelSizeWithMargin  }}>
                            {
                              Array.from(Array(48)).map((x, j) => {
                                const pos = i * 6 + (j >> 3);
                                const innerPos = 1 << (7 - (j & 7));
                                return (
                                  <div
                                    key={j}
                                    style={{
                                      height: pixelSize,
                                      width: pixelSize,
                                      margin: marginSize,
                                      display: "inline-block",
                                      borderRadius: "8px 4px",
                                      border: image[pos] & innerPos ? "transparent" : "1px solid #7773",
                                      background: image[pos] & innerPos ? "#e8abff" : "transparent",
                                    }} />
                                )
                              })
                            }
                          </div>
                        ))
                      }
                    </div>
                  </Box>
                </Box>
              </Box>
            );
          })
        }
        </SimpleGrid>
        <Heading as='h4' size='md' my={4}>Encoded</Heading>
        <Textarea
          isInvalid={invalidInput}
          multiple
          errorBorderColor='red.300'
          value={encoded}
          onChange={(e) => {
            setEncoded(e.target.value);
            let isInvalid = false;
            let images = e.target.value.split("\n").filter(x => x.length > 0);
            for(const im of images) {
              try {
                const arr = decodeBitmap(im);
                if (!arr) {
                  isInvalid = true;
                }
              } catch (e) {
                isInvalid = true;
              }
            }
            if (!isInvalid) {
              play(images);
            }
          }}
          size='xs'
        />
      </Box>
    </div>
  );
}
