import { VStack, IStackProps, Image, Text, Heading, Box } from "native-base";

type Props = IStackProps & {
  title: string;
  price: string;
  used: boolean;
  active: boolean;
  image: string;
};

export const Ad = ({ title, price, used, active, image, ...rest }: Props) => {
  return (
    <VStack position="relative" {...rest} w="45%">
      <Heading
        textTransform="uppercase"
        color={active ? "white" : "gray.500"}
        fontSize={10}
        bg={!used ? "blue.light" : "gray.200"}
        position="absolute"
        zIndex={100}
        borderRadius={10}
        py={1}
        px={2}
        right={2}
        top={2}
      >
        {used ? "Usado" : "Novo"}
      </Heading>
      <Box position="relative">
        {!active && (
          <Heading
            textTransform="uppercase"
            color="gray.200"
            fontSize={10}
            position="absolute"
            left={2}
            bottom="2"
            zIndex={100}
          >
            Anúncio Desativado
          </Heading>
        )}
        <Image
          h={20}
          w={40}
          source={{
            uri: image,
          }}
          alt={title}
          resizeMode="cover"
          borderRadius={10}
          blurRadius={active ? 0 : 10}
        />
      </Box>

      <Text color={active ? "gray.200" : "gray.400"} fontSize={14} mt={1}>
        {title}
      </Text>
      <Heading color={active ? "gray.200" : "gray.400"} fontSize={14}>
        R$ {price}
      </Heading>
    </VStack>
  );
};