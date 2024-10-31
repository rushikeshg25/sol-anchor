'use client'

import {getVotingfinaldappProgram, getVotingfinaldappProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useVotingfinaldappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVotingfinaldappProgramId(cluster.network as Cluster), [cluster])
  const program = getVotingfinaldappProgram(provider)

  const accounts = useQuery({
    queryKey: ['votingfinaldapp', 'all', { cluster }],
    queryFn: () => program.account.votingfinaldapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['votingfinaldapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ votingfinaldapp: keypair.publicKey }).signers([keypair]).rpc(),
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

export function useVotingfinaldappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useVotingfinaldappProgram()

  const accountQuery = useQuery({
    queryKey: ['votingfinaldapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.votingfinaldapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['votingfinaldapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ votingfinaldapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['votingfinaldapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ votingfinaldapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['votingfinaldapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ votingfinaldapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['votingfinaldapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ votingfinaldapp: account }).rpc(),
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
