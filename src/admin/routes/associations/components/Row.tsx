
import { Text, clx } from "@medusajs/ui"
import { Link } from "react-router-dom"

export type SectionRowProps = {
  title: string
  id: string
  value?: React.ReactNode | string | null
  actions?: React.ReactNode
}

export const Row = ({ title, id, value, actions }: SectionRowProps) => {
  const isValueString = typeof value === "string" || !value

  return (
    <Link
        to={`/vary-associations/${id}`}
        className="flex justify-between w-full">
    <div
      className={clx(
        `text-ui-fg-subtle grid grid-cols-2 w-full items-center space-x-2 px-6 py-4 cursor-pointer hover:bg-ui-bg-base-hover`,
        {
          "grid-cols-[1fr_1fr_28px]": !!actions,
        }
      )}
    >
        <Text size="small" weight="plus" leading="compact">
          {title}
        </Text>

        {isValueString ? (
          <Text
            size="small"
            leading="compact"
            className="whitespace-pre-line text-pretty text-center"
          >
            {value ?? "-"}
          </Text>
        ) : (
          <div className="flex flex-wrap gap-1">{value}</div>
        )}
      {actions && <div>{actions}</div>}
    </div>
    </Link>
  )
}