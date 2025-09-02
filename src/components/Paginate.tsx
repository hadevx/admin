import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Paginate = ({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: number;
  setPage: (p: number) => void;
}) => {
  return (
    <Pagination className="py-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => page > 1 && setPage(page - 1)} href="#" />
        </PaginationItem>

        {[...Array(pages).keys()].map((x) => (
          <PaginationItem key={x + 1}>
            <PaginationLink href="#" isActive={page === x + 1} onClick={() => setPage(x + 1)}>
              {x + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext onClick={() => page < pages && setPage(page + 1)} href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default Paginate;
