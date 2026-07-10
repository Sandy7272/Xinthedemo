# Sample images for the demo

These images power the in-app file explorer and the Virtual Try-On before/after.
Any file that's missing shows a labelled gradient placeholder, so the UI never
looks broken.

## Already added ✓

| File                      | What it is                             | Used for |
| ------------------------- | -------------------------------------- | -------- |
| `before.png`              | Man in the pink striped shirt          | Try-On **before / input** + person picker |
| `after.png`               | Man in the red Xinthe sweatshirt       | Try-On **after / output** + person picker |
| `product-xinthe-red.png`  | Flat red Xinthe sweatshirt (front)     | Studio front view + product picker |

Paths are configured in `src/lib/easyvariants/config.ts`
(`SAMPLE_PRODUCT_IMAGES`, `SAMPLE_PERSON_IMAGES`, and `TRYON`).

## Optional extras

Add any of these (matching names) to enrich the pickers:

```
sweatshirt-back.png   sweatshirt-left.png   sweatshirt-right.png
sweatshirt-top.png    sweatshirt-bottom.png product-flatlay.png
model-03.jpg          model-04.jpg
```
