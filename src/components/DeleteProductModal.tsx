import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Loader2Icon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { texts } from "@/pages/products/translation";

type RootState = { language: { lang: "ar" | "en" } };

type Props = {
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (v: boolean) => void;
  loadingDeleteProduct: boolean;
  handleDeleteProduct: () => void;
};

const DeleteProductModal = ({
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  loadingDeleteProduct,
  handleDeleteProduct,
}: Props) => {
  const language = useSelector((state: RootState) => state.language.lang);
  const t = useMemo(() => texts[language], [language]);

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.deleteConfirmTitle}</DialogTitle>
          <DialogDescription>{t.deleteConfirmDesc}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            {t.cancel}
          </Button>

          <Button
            disabled={loadingDeleteProduct}
            variant="destructive"
            className="bg-gradient-to-t from-rose-500 to-rose-400 hover:opacity-90"
            onClick={handleDeleteProduct}>
            {loadingDeleteProduct ? <Loader2Icon className="animate-spin" /> : t.deleteBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductModal;
