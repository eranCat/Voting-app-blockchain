// frontend/gui/src/app/providers.tsx
'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { sepolia } from 'wagmi/chains';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL!;
const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
    chains: [sepolia],
    transports: { [sepolia.id]: http(rpcUrl) },
    connectors: [injected()],
    // note: no `autoConnect` in wagmi v2; use reconnectOnMount on the Provider instead
});

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={wagmiConfig} reconnectOnMount>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
