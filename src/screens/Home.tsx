import { useState, useCallback, useEffect } from 'react'
import {
  HStack,
  VStack,
  Image,
  Heading,
  Text,
  Input,
  Modal,
  Button as NativeButton,
  Checkbox,
  Switch,
  Radio,
  useToast,
  FlatList,
  Center,
  Box,
} from 'native-base'
import { TouchableOpacity } from 'react-native'

import { Controller, useForm } from 'react-hook-form'

import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { api } from '@services/api'

import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Button } from '@components/Button'
import { AdCard } from '@components/AdCard'

import { useAuth } from '@hooks/useAuth'

import { ProductDTO } from '@dtos/ProductDTO'

import {
  Plus,
  ArrowRight,
  MagnifyingGlass,
  Sliders,
  Tag,
} from 'phosphor-react-native'
import { AppError } from '@utils/AppError'
import { Loading } from '@components/Loading'
import { ButtonCreate } from '@components/ButtonCreate'

type FormDataProps = {
  search: string
}

const signInSchema = yup.object({
  search: yup.string(),
})

export const Home = () => {
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false)
  const [isNew, setIsNew] = useState(true)
  const [paymentMethods, setPaymentMethods] = useState<string[]>([
    'pix',
    'boleto',
    'cash',
    'deposit',
    'card',
  ])
  const [isLoadingSecondary, setIsLoadingSecondary] = useState(false)
  const [acceptTrade, setAcceptTrade] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [numberOfAds, setNumberOfAds] = useState(0)
  const [products, setProducts] = useState<ProductDTO[]>([])

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const { user } = useAuth()
  const toast = useToast()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    defaultValues: {
      search: '',
    },
    resolver: yupResolver(signInSchema),
  })

  const handleCreateAd = () => {
    navigation.navigate('createad')
  }

  const handleSeeMyAds = () => {
    navigation.navigate('app', { screen: 'myads' })
  }

  const handleApplyFilters = async ({ search }: FormDataProps) => {
    setShowFiltersModal(false)

    try {
      let paymentMethodsQuery = ''

      paymentMethods.forEach((item) => {
        paymentMethodsQuery = paymentMethodsQuery + `&payment_methods=${item}`
      })

      setIsLoadingSecondary(true)
      const productsData = await api.get(
        `/products/?is_new=${isNew}&accept_trade=${acceptTrade}${paymentMethodsQuery}${
          search.length > 0 && `&query=${search}`
        }`,
      )

      setProducts(productsData.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível receber os produtos. Tente Novamente!'

      if (isAppError) {
        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        })
      }
    } finally {
      setIsLoadingSecondary(false)
    }
  }

  const handleResetFilters = () => {
    setIsNew(true)
    setAcceptTrade(false)
    setPaymentMethods(['pix', 'boleto', 'cash', 'deposit', 'card'])
  }

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const productsData = await api.get(`/users/products`)
          const generalProductsData = await api.get('/products')

          setProducts(generalProductsData.data)
          setNumberOfAds(productsData.data.length)
        } catch (error) {
          const isAppError = error instanceof AppError
          const title = isAppError
            ? error.message
            : 'Não foi possível receber os produtos. Tente Novamente!'

          if (isAppError) {
            toast.show({
              title,
              placement: 'top',
              bgColor: 'red.500',
            })
          }
        } finally {
          setIsLoading(false)
        }
      }

      loadData()
    }, []),
  )

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <VStack flex={1} p={5}>
          <HStack w="full" mt={12} alignItems="center">
            <Image
              h="12"
              w="12"
              source={{
                uri: `${api.defaults.baseURL}/images/${user.avatar}`,
              }}
              alt="Foto de perfil"
              borderRadius="full"
              borderWidth={2}
              borderColor="blue.light"
            />

            <VStack ml="3">
              <Text color="gray.100" fontSize={16}>
                Boas Vindas,
              </Text>
              <Heading color="gray.100" fontSize={16} fontFamily="heading">
                {`${user.name[0].toUpperCase() + user.name.substring(1)}!`}
              </Heading>
            </VStack>

            <ButtonCreate
              title="Criar anúncio"
              icon={<Plus color="white" size={20} />}
              variant="secondary"
              width="40"
              h="12"
              position="absolute"
              right={0}
              onPress={handleCreateAd}
            />
          </HStack>

          <Text color="gray.300" fontSize={14} mt="7">
            Seus produtos anunciados para venda
          </Text>

          <TouchableOpacity onPress={handleSeeMyAds}>
            <HStack
              alignItems="center"
              w="full"
              h="20"
              bg="#d3daf199"
              p="5"
              borderRadius="8"
              mt="2"
            >
              <Tag color="#364D9D" weight="regular" size={28} />

              <VStack ml="5">
                <Heading
                  color="gray.200"
                  fontSize="xl"
                  fontFamily="heading"
                  mb={2}
                >
                  {numberOfAds}
                </Heading>
                <Text color="gray.200" fontSize={12} mt={-2}>
                  anúncios ativos
                </Text>
              </VStack>

              <HStack position="absolute" right={5}>
                <Heading
                  color="#364D9D"
                  mr="2"
                  fontSize={14}
                  fontFamily="heading"
                >
                  Meus anúncios
                </Heading>
                <ArrowRight color="#364D9D" size="20" weight="regular" />
              </HStack>
            </HStack>
          </TouchableOpacity>

          <Text color="gray.300" fontSize={14} mt="7">
            Compre produtos variados
          </Text>

          <HStack
            w="full"
            alignItems="center"
            mt="2"
            bg="white"
            borderRadius={8}
            pr="1"
            mb="5"
          >
            <Controller
              control={control}
              name="search"
              rules={{ required: 'Informe o nome do produto' }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Input
                    placeholder="Buscar anúncio"
                    minH={14}
                    px={4}
                    borderWidth={0}
                    borderRadius={8}
                    fontSize="md"
                    color="gray.200"
                    fontFamily="body"
                    placeholderTextColor="gray.400"
                    bg="white"
                    width="50%"
                    onChangeText={onChange}
                    value={value}
                    flex={1}
                    _focus={{
                      bg: 'white',
                    }}
                  />
                  {errors.search?.message && (
                    <Text
                      position="absolute"
                      top="-20"
                      right="4"
                      color="red.light"
                    >
                      {errors.search?.message}
                    </Text>
                  )}
                </>
              )}
            />

            <NativeButton
              onPress={handleSubmit(handleApplyFilters)}
              bg="white"
              _pressed={{
                bg: 'gray.500',
              }}
            >
              <MagnifyingGlass weight="bold" color="#5F5B62" />
            </NativeButton>
            <NativeButton
              onPress={() => setShowFiltersModal(true)}
              bg="white"
              _pressed={{
                bg: 'gray.500',
              }}
            >
              <Sliders weight="bold" color="#5F5B62" />
            </NativeButton>
          </HStack>

          {isLoadingSecondary ? (
            <Center flex={1} justifyContent="center">
              <Loading />
            </Center>
          ) : (
            <FlatList
              flex={1}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              numColumns={2}
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AdCard
                  width={165}
                  title={item.name}
                  image={`${api.defaults.baseURL}/images/${item.product_images[0].path}`}
                  active={item.is_active}
                  used={!item.is_new}
                  price={item.price.toString()}
                  id={item.id}
                  showProfile
                  profileImage={`${api.defaults.baseURL}/images/${item.user?.avatar}`}
                />
              )}
              ListEmptyComponent={() => (
                <Center>
                  {isNew && !acceptTrade && paymentMethods.length === 5 ? (
                    <Text color="gray.300" textAlign="center">
                      Parece que nenhum produto foi anunciado ainda!
                    </Text>
                  ) : (
                    <Text color="gray.300" textAlign="center">
                      Parece que nenhum produto com esses filtros foi anunciado
                      acima!
                    </Text>
                  )}
                </Center>
              )}
            />
          )}
        </VStack>
      )}

      <Modal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        size="xl"
      >
        <Modal.Content marginBottom="5" marginTop="auto">
          <Box
            w={20}
            h={1}
            bg="gray.500"
            position="relative"
            left={135}
            mt={3}
            borderRadius={999}
          />

          <Box p={4} mt={3}>
            <Heading color="gray.200" fontSize={20} fontFamily="heading">
              Filtrar anúncios
            </Heading>
            <Modal.CloseButton />
          </Box>

          <Modal.Body alignItems="flex-start">
            <Heading
              color="gray.200"
              fontSize={16}
              my={2}
              mt={-2}
              fontFamily="heading"
            >
              Condição
            </Heading>

            <Radio.Group
              name="productCondition"
              value={isNew ? 'new' : 'used'}
              onChange={(nextValue) => {
                setIsNew(nextValue === 'new')
              }}
            >
              <HStack>
                <Radio value="new" my="2" size="sm">
                  <Text color="gray.200" fontSize={14}>
                    Novo
                  </Text>
                </Radio>
                <Radio value="used" my="2" ml={5} size="sm">
                  <Text color="gray.200" fontSize={14}>
                    Usado
                  </Text>
                </Radio>
              </HStack>
            </Radio.Group>

            <Heading color="gray.200" fontSize={16} my={2} fontFamily="heading">
              Aceita troca?
            </Heading>

            <Switch
              onToggle={(value) => setAcceptTrade(value)}
              value={acceptTrade}
              size="lg"
              m={2}
            />

            <Heading color="gray.200" fontSize={16} my={2} fontFamily="heading">
              Meios de pagamento
            </Heading>

            <Checkbox.Group
              onChange={setPaymentMethods}
              value={paymentMethods}
              m={1}
            >
              <Checkbox value="boleto" mb={1}>
                <Text color="gray.300" fontSize={16}>
                  Boleto
                </Text>
              </Checkbox>
              <Checkbox value="pix" mb={1}>
                <Text color="gray.300" fontSize={16}>
                  Pix
                </Text>
              </Checkbox>
              <Checkbox value="cash" mb={1}>
                <Text color="gray.300" fontSize={16}>
                  Dinheiro
                </Text>
              </Checkbox>
              <Checkbox value="card" mb={1}>
                <Text color="gray.300" fontSize={16}>
                  Cartão de Crédito
                </Text>
              </Checkbox>
              <Checkbox value="deposit">
                <Text color="gray.300" fontSize={16}>
                  Depósito Bancário
                </Text>
              </Checkbox>
            </Checkbox.Group>
          </Modal.Body>

          <HStack
            w="full"
            py={2}
            px={5}
            mb={5}
            alignItems="center"
            justifyContent="space-between"
          >
            <Button
              variant="secondary"
              title="Resetar Filtros"
              alignItems="center"
              justifyContent="center"
              w="48%"
              h={12}
              onPress={handleResetFilters}
            />
            <ButtonCreate
              title="Aplicar Filtros"
              alignItems="center"
              justifyContent="center"
              w="48%"
              h={12}
              onPress={handleSubmit(handleApplyFilters)}
            />
          </HStack>
        </Modal.Content>
      </Modal>
    </>
  )
}
