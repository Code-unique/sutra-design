"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ label, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <Card className="w-full max-w-md text-center shadow-md border border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-10">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-lg font-medium">{label}</p>
          {actionLabel && (
            <Button variant="default" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
