/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import { createContext, ReactNode, useState, useEffect } from 'react'

import { UserDTO } from '@dtos/UserDTO'

import {
  storageUserGet,
  storageUserRemove,
  storageUserSave,
} from '@storage/storageUser'

import {
  storageAuthTokenSave,
  storageAuthTokenGet,
  storageAuthTokenRemove,
} from '@storage/storageAuthToken'

import { api } from '@services/api'

export type AuthContextDataProps = {
  user: UserDTO
  singIn: (email: string, password: string) => void
  token: string
  signOut: () => void
}

type AuthContextProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps,
)

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [user, setUser] = useState<UserDTO>({} as UserDTO)
  const [token, setToken] = useState<string>('')

  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true)

  const storageUserAndTokenSave = async (
    userData: UserDTO,
    token: string,
    refresh_token: string,
  ) => {
    try {
      setIsLoadingUserStorageData(true)

      await storageUserSave(userData)
      await storageAuthTokenSave({ token, refresh_token })
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  const userAndTokenUpdate = (userData: UserDTO, token: string) => {
    api.defaults.headers.common.Authorization = `Bearer ${token}`

    setUser(userData)
  }

  const loadUserData = async () => {
    try {
      setIsLoadingUserStorageData(true)

      const userLogged = await storageUserGet()
      const { token } = await storageAuthTokenGet()

      if (token && userLogged) {
        userAndTokenUpdate(userLogged, token)
      }
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoadingUserStorageData(true)
      setUser({} as UserDTO)
      await storageUserRemove()
      await storageAuthTokenRemove()
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  const singIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/sessions', { email, password })

      if (data.user && data.token && data.refresh_token) {
        await storageUserAndTokenSave(data.user, data.token, data.refresh_token)
        userAndTokenUpdate(data.user, data.token)
      }
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager(signOut)
    return () => {
      subscribe()
    }
  }, [])

  useEffect(() => {
    loadUserData()
  }, [])

  return (
    <AuthContext.Provider value={{ user, singIn, token, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
