'use client'

import {getSocialmediadappProgram, getSocialmediadappProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useSocialmediadappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSocialmediadappProgramId(cluster.network as Cluster), [cluster])
  const program = getSocialmediadappProgram(provider)

  const accounts = useQuery({
    queryKey: ['socialmediadapp', 'all', { cluster }],
    queryFn: () => program.account.socialmediadapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['socialmediadapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ socialmediadapp: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useSocialmediadappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useSocialmediadappProgram()

  const accountQuery = useQuery({
    queryKey: ['socialmediadapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.socialmediadapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['socialmediadapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ socialmediadapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['socialmediadapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ socialmediadapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['socialmediadapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ socialmediadapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['socialmediadapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ socialmediadapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
