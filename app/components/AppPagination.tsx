import { ChevronLeft, ChevronRight } from "images/icons";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "./ui/pagination";
import { useLocation, useNavigation, useSearchParams } from "@remix-run/react";
import clsx from "clsx";

type AppPaginationProps = {
  page: number;
  totalPages: number;
}

export function AppPagination({ page, totalPages }: AppPaginationProps) {
  const location = useLocation();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const createPageUrl = (pageNum: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", pageNum.toString());
    return `${location.pathname}?${newSearchParams.toString()}`;
  };

  const getSiblingPages = () => {
    const siblings: number[] = [];
    const show = 2; // Show 2 siblings on each side when possible

    for (let i = Math.max(1, page - show); i <= Math.min(totalPages, page + show); i++) {
      siblings.push(i);
    }

    return siblings;
  };

  return (
    <div className="flex justify-center mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              to={createPageUrl(page - 1)}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </PaginationLink>
          </PaginationItem>

          {page > 3 && (
            <>
              <PaginationItem>
                <PaginationLink to={createPageUrl(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
          )}

          {getSiblingPages().map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                to={createPageUrl(pageNum)}
                isActive={pageNum === page}
                className={clsx(
                  navigation.state === "loading" && pageNum === parseInt(searchParams.get("page") ?? "1") ? "animate-pulse" : "",
                  pageNum === page ? "bg-primary text-primary-foreground" : ""
                )}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}

          {page < totalPages - 2 && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink to={createPageUrl(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationLink
              to={createPageUrl(page + 1)}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}