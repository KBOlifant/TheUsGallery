'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { setAuthTokenProvider } from '../functions/client'
import { getMe } from '../functions/api'

const AuthContext = createContext(null)

// Make the API client send the current user's ID token on every request.
setAuthTokenProvider(() => (auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)))

/** Turn Firebase error codes into readable messages. */
function friendly(err) {
  const code = err?.code || ''
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
    return 'Incorrect email or password.'
  if (code.includes('email-already-in-use')) return 'That email already has an account — try signing in.'
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.'
  if (code.includes('invalid-email')) return 'That doesn’t look like a valid email.'
  if (code.includes('popup-closed-by-user')) return 'Sign-in was cancelled.'
  return err?.message || 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // Firebase user
  const [profile, setProfile] = useState(null) // backend profile { role, status, … }
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) {
      setProfile(null)
      return null
    }
    try {
      const me = await getMe()
      setProfile(me)
      return me
    } catch {
      setProfile(null)
      return null
    }
  }, [])

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      await refreshProfile()
      setLoading(false)
    })
  }, [refreshProfile])

  const signInEmail = useCallback(async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      throw new Error(friendly(err))
    }
  }, [])

  const signUpEmail = useCallback(async (email, password, displayName) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) await updateProfile(cred.user, { displayName })
      await refreshProfile()
    } catch (err) {
      throw new Error(friendly(err))
    }
  }, [refreshProfile])

  const signInGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      throw new Error(friendly(err))
    }
  }, [])

  const logout = useCallback(() => signOut(auth), [])

  const value = {
    user,
    profile,
    loading,
    isAuthed: !!user,
    isApproved: profile?.status === 'approved',
    isAdmin: profile?.role === 'admin',
    isCoAdmin: profile?.role === 'co-admin',
    // Admins and co-admins may create their own category/collection while uploading.
    canManageCollections: profile?.role === 'admin' || profile?.role === 'co-admin',
    status: profile?.status ?? null,
    refreshProfile,
    signInEmail,
    signUpEmail,
    signInGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
