import {useEffect, useState} from "react";
import {Box, Center, Heading, Input} from "@chakra-ui/react";
import {decodeBitmap, encodeBitmap} from "./images";

const defaultImage = "AAAAAAAAAAAAAAAAAAAAAAAVAAAAAAAVAAAAAAAXACJknJORADKVIqRRACrmIsRAACaFIqRAACJ0nJOAAAAAAAAAAAAAAAAA";

const pixelSize = 15;
const marginSize = 1;
const pixelSizeWithMargin = pixelSize + 2 * marginSize;

export function PixelScreen() {
  const [mouseDown, setMouseDown] = useState(false);
  const [image, setImage] = useState(defaultImage);
  const [invalidInput, setInvalidInput] = useState(false);
  const [encoded, setEncoded] = useState(false);

  const { SGuai } = window;

  useEffect(() => {
    let image = decodeBitmap(defaultImage);
    try {
      let localImage = decodeBitmap(localStorage.image);
      if (localImage) image = localImage;
    } catch {

    }
    setImage(image);
    setEncoded(encodeBitmap(image));
    SGuai.send(0x25, image);
  }, [SGuai]);

  const play = async (image) => {
    setImage([...image]);
    SGuai.send(0x25, image);
    setEncoded(encodeBitmap(image));
    localStorage.image = encodeBitmap(image);
  }

  return (
    <div>
      <Box mt={4}>
        <Heading as='h4' size='md' my={4}>Pixel Screen (48x12)</Heading>
        <Center>
          <Box
            style={{ overflowX: "auto" }}
            py={4}
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
                        const flipBit = () => {
                          image[pos] ^= innerPos;
                          play(image);
                        }
                        return (
                          <div
                            key={j}
                            onClick={flipBit}
                            onMouseEnter={() => {
                              if (mouseDown) flipBit();
                            }}
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
        </Center>
        <Heading as='h4' size='md' my={4}>Base64 Encoded</Heading>
        <Input
          isInvalid={invalidInput}
          errorBorderColor='red.300'
          value={encoded}
          onChange={(e) => {
            setEncoded(e.target.value);
            try {
              const arr = decodeBitmap(e.target.value);
              if (arr) {
                play(arr);
                setInvalidInput(false);
              } else {
                setInvalidInput(true);
              }
            } catch (e) {
              setInvalidInput(true);
            }
          }}
          size='xs'
        />
      </Box>
    </div>
  );
}
