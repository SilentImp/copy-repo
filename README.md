# Copy repository to new owner

Copy repository from old owner to new one. 
Repository should be marked as template.
Only main branch copied.

This can be done by executing:

```bash
npx copy-repo -r Hover-zoom -o prj-ytb -n silentimp -t ghp_aqwZtkTrJUhdkUjdP7uTFbeFvw3jylom
```
where: 
- `Hover-zoom` – name of the repository you want to copy, 
- `prj-ytb` - name of the old owner
- `silentimp` - name of the new owner
- `ghp_aqwZtkTrJUhdkUjdP7uTFbeFvw3jylom` - GitHub token, that allow to work with repository

You can find more information by executing: 

```bash
npx copy-repo --help
```
