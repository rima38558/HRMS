import React, { createContext, useContext, useEffect, useState } from 'react'

type User = { id: string; name: string; email: string } | null

const UserContext = createContext<{ user: User; loading: boolean; refresh: () => Promise<void> }>({ user: null, loading: true, refresh: async () => {} })

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    setLoading(true)
    try{
      const res = await fetch('/api/auth/me')
      if (res.ok){
        const data = await res.json()
        setUser(data.user)
      }else{
        setUser(null)
      }
    }catch(e){
      setUser(null)
    }finally{ setLoading(false) }
  }

  useEffect(() => { fetchMe() }, [])

  return <UserContext.Provider value={{ user, loading, refresh: fetchMe }}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
