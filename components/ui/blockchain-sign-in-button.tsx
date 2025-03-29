// components/ui/blockchain-sign-in-button.tsx

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/button";
import { forwardRef } from "react";

export interface BlockchainSignInButtonProps extends ButtonProps {}

const BlockchainSignInButton = forwardRef<HTMLButtonElement, BlockchainSignInButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        variant="outline"
        className={cn(
          "flex items-center justify-center gap-2 bg-background hover:bg-muted border-border",
          className
        )}
        ref={ref}
        {...props}
      >
        <Image
          src="/icons/ethereum.svg"
          alt="Ethereum"
          width={16}
          height={16}
          className="h-4 w-4"
        />
        {children}
      </Button>
    );
  }
);

BlockchainSignInButton.displayName = "BlockchainSignInButton";

export { BlockchainSignInButton };
