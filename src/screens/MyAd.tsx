/* eslint-disable camelcase */
import { useState, useEffect } from 'react'
import { Alert, Dimensions, StatusBar } from 'react-native'

import {
  ScrollView,
  Text,
  VStack,
  HStack,
  Button as NativeButton,
  Image,
  Heading,
  useTheme,
  useToast,
  Box,
} from 'native-base'

import { useNavigation, useRoute } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Button } from '@components/Button'
import { Loading } from '@components/Loading'

import { ArrowLeft, Pencil, Power, Trash } from 'phosphor-react-native'

import { ProductDTO } from '../dtos/ProductDTO'

import { AppError } from '@utils/AppError'
import { api } from '@services/api'

import Carousel from 'react-native-reanimated-carousel'

import { GeneratePaymentMethods } from '@utils/generatePaymentMethods'
import { ButtonCreate } from '@components/ButtonCreate'

type RouteParams = {
  id: string
}

export const MyAd = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingLoading, setIsDeletingLoading] = useState(false)
  const [isChangingVisibilityLoading, setIsChangingVisibilityLoading] =
    useState(false)
  const [product, setProduct] = useState({} as ProductDTO)

  const route = useRoute()
  const toast = useToast()
  const { colors } = useTheme()

  const width = Dimensions.get('window').width

  const { id } = route.params as RouteParams

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const handleGoEditAd = () => {
    navigation.navigate('editad', {
      title: product.name,
      description: product.description,
      price: product.price.toString(),
      images: product.product_images,
      paymentMethods: product.payment_methods.map((item) => item.key),
      isNew: product.is_new,
      acceptTrade: product.accept_trade,
      id: product.id,
    })
  }

  const handleChangeAdVisibility = async () => {
    try {
      setIsChangingVisibilityLoading(true)
      await api.patch(`products/${id}`, {
        is_active: !product.is_active,
      })

      setProduct((state) => {
        return {
          ...state,
          is_active: !state.is_active,
        }
      })
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'N??o foi poss??vel deletar. Tente Novamente!'

      if (isAppError) {
        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        })
      }
    } finally {
      setIsChangingVisibilityLoading(false)
    }
  }

  const handleDeleteAd = async () => {
    try {
      setIsDeletingLoading(true)
      await api.delete(`products/${id}`)

      navigation.navigate('app', { screen: 'myads' })
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'N??o foi poss??vel deletar. Tente Novamente!'

      if (isAppError) {
        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        })
      }
    } finally {
      setIsDeletingLoading(false)
    }
  }

  const handleButtonRemoveAd = () => {
    Alert.alert('Excluir', 'Deseja excluir o an??ncio?', [
      { text: 'N??o', style: 'cancel' },
      { text: 'Sim', onPress: () => handleDeleteAd() },
    ])
  }

  const handleGoBack = () => {
    navigation.navigate('app', { screen: 'myads' })
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const productData = await api.get(`products/${id}`)
        setProduct(productData.data)
        setIsLoading(false)
      } catch (error) {
        const isAppError = error instanceof AppError
        const title = isAppError
          ? error.message
          : 'N??o foi poss??vel receber os dados do an??ncio. Tente Novamente!'

        if (isAppError) {
          toast.show({
            title,
            placement: 'top',
            bgColor: 'red.500',
          })
        }
      }
    }

    loadData()
  }, [])

  return (
    <>
      <StatusBar backgroundColor={colors.gray[600]} />
      {isLoading ? (
        <Loading />
      ) : (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <VStack flex={1}>
            <HStack w="full" justifyContent="space-between" mt={10}>
              <NativeButton variant="secondary" px={5} onPress={handleGoBack}>
                <ArrowLeft color={colors.gray[200]} />
              </NativeButton>

              <NativeButton variant="secondary" px={5} onPress={handleGoEditAd}>
                <Pencil color={colors.gray[200]} />
              </NativeButton>
            </HStack>

            <Box
              position="relative"
              alignItems="center"
              justifyContent="center"
            >
              {!product.is_active && (
                <Box
                  position="absolute"
                  zIndex={100}
                  w={400}
                  bg="#1A181B99"
                  height={320}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Heading
                    textTransform="uppercase"
                    color="white"
                    fontSize="lg"
                    textAlign="center"
                    fontFamily="heading"
                  >
                    An??ncio Desativado
                  </Heading>
                </Box>
              )}
              <Carousel
                loop
                width={width}
                height={320}
                autoPlay={product.product_images.length > 1}
                data={product.product_images}
                scrollAnimationDuration={1000}
                renderItem={({ item }) => (
                  <Image
                    w="full"
                    h={80}
                    source={{
                      uri: `${api.defaults.baseURL}/images/${item.path}`,
                    }}
                    alt="Ad Image"
                    resizeMode="cover"
                  />
                )}
              />
            </Box>

            <VStack px={5}>
              <HStack mb={6} mt={4} alignItems="center">
                <Image
                  h={8}
                  w={8}
                  source={{
                    uri: `${api.defaults.baseURL}/images/${product.user?.avatar}`,
                  }}
                  alt="user image"
                  borderRadius="full"
                  borderWidth={2}
                  borderColor="blue.light"
                />
                <Heading
                  color="gray.100"
                  fontSize={16}
                  ml={2}
                  textTransform="capitalize"
                >
                  {product.user?.name}
                </Heading>
              </HStack>
              <Box
                w={50}
                h={5}
                mb={2}
                bg="gray.500"
                alignItems="center"
                justifyContent="center"
                borderRadius={9999}
              >
                <Heading
                  textTransform="uppercase"
                  color="gray.100"
                  fontSize={12}
                  fontFamily="heading"
                >
                  {product.is_new ? 'NOVO' : 'USADO'}
                </Heading>
              </Box>
              <HStack
                w="full"
                justifyContent="space-between"
                alignItems="center"
              >
                <Heading color="gray.200" fontSize={22} fontFamily="heading">
                  {product.name}
                </Heading>
                <Text color="blue.light" fontFamily="heading">
                  <Heading
                    color="blue.light"
                    fontFamily="heading"
                    fontSize={20}
                  >
                    R$ {product.price}
                  </Heading>
                </Text>
              </HStack>

              <Text mt={2} color="gray.300">
                {product.description}
              </Text>

              <Heading
                color="gray.300"
                fontSize={14}
                my={5}
                fontFamily="heading"
              >
                Aceita troca?{' '}
                <Text fontWeight="normal" fontFamily="body">
                  {product.accept_trade ? 'Sim' : 'N??o'}
                </Text>
              </Heading>

              <Heading
                color="gray.300"
                fontSize={14}
                mb={2}
                fontFamily="heading"
              >
                Meios de Pagamento:
              </Heading>

              {GeneratePaymentMethods(
                product.payment_methods.map(
                  (payment_method) => payment_method.key,
                ),
              )}
            </VStack>

            <VStack px={5} my={5} mt={12}>
              <ButtonCreate
                title={
                  product.is_active ? 'Desativar An??ncio' : 'Reativar An??ncio'
                }
                onPress={handleChangeAdVisibility}
                icon={<Power size={22} color="white" />}
                mb={2}
                isLoading={isChangingVisibilityLoading}
              />
              <Button
                title="Excluir An??ncio"
                variant="secondary"
                icon={<Trash size={22} color="gray" />}
                onPress={handleButtonRemoveAd}
                isLoading={isDeletingLoading}
              />
            </VStack>
          </VStack>
        </ScrollView>
      )}
    </>
  )
}
