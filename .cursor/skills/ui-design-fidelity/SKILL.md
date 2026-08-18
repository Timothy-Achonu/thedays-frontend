---
name: ui-design-fidelity
description: Strict visual reproduction guidance for the TheDays web app. Use when matching screenshots, Figma designs, reference images, dialogs, responsive UI, or any task where visual fidelity matters more than reinterpretation.
---

Your task is **strict visual reproduction**, not design interpretation.

Follow these rules:

1. **Do not redesign anything.**
   Do not improve, simplify, modernize, or reinterpret the UI. Your job is to **replicate the design exactly as shown**.

2. **Treat the image as the single source of truth.**
   Every visible detail in the image must be reproduced.

3. **Match visual details precisely**, including but not limited to:

   - spacing and layout
   - padding and margins
   - colors
   - font sizes and weights
   - border radii
   - borders and shadows
   - alignment
   - icon placement
   - component proportions

4. **Do not introduce new UI patterns** unless they are clearly visible in the design.

5. **Do not omit elements** that appear in the image.

6. **Do not add elements** that are not present in the image.

7. **Follow the patterns already used in this codebase**, including:

   - component structure
   - naming conventions
   - styling patterns
   - utilities and helper functions
   - existing design tokens

8. **Reuse existing components whenever possible** rather than inventing new ones, as long as the final UI still matches the design exactly.

9. **Prioritize visual accuracy over personal judgement.**
   If something in the design looks unusual or suboptimal, reproduce it anyway.

10. The final result should look **indistinguishable from the design image**.

11. If a visual detail is ambiguous, estimate it from the image rather than inventing a new design.
