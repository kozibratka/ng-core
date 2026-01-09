import { TreeNode } from 'primeng/api';

export class TreeHelper {
    static findNodeByKey(nodes: TreeNode[], key: string): TreeNode | null {
        for (const node of nodes) {
            if (node.key === key) {
                return node;
            }
            if (node.children) {
                const found = this.findNodeByKey(node.children, key);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }
}
