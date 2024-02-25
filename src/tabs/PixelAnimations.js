import {useContext, useEffect, useState} from "react";
import {Box, Button, Heading, Text, Textarea} from "@chakra-ui/react";
import {decodeBitmap} from "./images";
import {FaPlay} from "react-icons/fa";
import {ConnectionContext} from "../Contexts";

const defaultImage = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const pixelSize = 7;
const marginSize = 0;
const pixelSizeWithMargin = pixelSize + 2 * marginSize;



export function PixelAnimations() {
  const [images, setImages] = useState([defaultImage, defaultImage, defaultImage]);
  const [invalidInput, setInvalidInput] = useState(false);
  const [encoded, setEncoded] = useState("");
  const connected = useContext(ConnectionContext);

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
    setEncoded(images.join("\n"));
  }, [SGuai]);

  const play = async (images) => {
    setImages(images);
    const duration = 0xdd;
    try {
      for (let i = 0; i < images.length; i++) {
        await SGuai.send(0x26, [i, duration, ...decodeBitmap(images[i])]);
      }
      //await SGuai.send(0x26, [images.length, duration, ...decodeBitmap(images[0])]);
      await SGuai.send(0x26, [images.length, duration]);
      localStorage.animation = images.join("\n");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Box>
      <Box>
        <Button leftIcon={<FaPlay />}
                colorScheme='pink'
                variant='solid'
                onClick={() => play(images)}
                isDisabled={!connected}
        >
          Play On Device
        </Button>
      </Box>
      <Heading as='h4' size='md' my={4}>Preview</Heading>
      <Box spacing={10}>
        {
          images.map((im, _idx) => {
            const image = decodeBitmap(im);
            return (
              <Box
                key={_idx}
                w={48 * pixelSizeWithMargin}
                display="inline-block"
                m={2}
              >
                <Box>
                  <Text>Frame {_idx}</Text>
                  <Box>
                    <div
                      style={{
                        width: 48 * pixelSizeWithMargin,
                        height: 12 * pixelSizeWithMargin,
                      }}
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
      </Box>
      <Heading as='h4' size='md' my={4}>Encoded</Heading>
      <Textarea
        isInvalid={invalidInput}
        multiple
        fontFamily="monospace"
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
  );
}
