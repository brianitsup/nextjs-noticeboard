import { updateCategoryIcons } from "../src/lib/categories"

async function main() {
  console.log('Updating category icons...')
  await updateCategoryIcons()
  console.log('Category icons updated successfully')
}

main().catch(console.error) 