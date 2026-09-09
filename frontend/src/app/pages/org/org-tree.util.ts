import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

export interface OrgTreeItem {
  deptNo: string;
  parentDeptNo?: string | null;
  orgNameLocal?: string | null;
  orgNameEng?: string | null;
}

/**
 * Dựng cây tổ chức thật (cha/con theo deptNo/parentDeptNo) từ danh sách phẳng OrgInfo - dùng chung cho
 * mọi trang org đọc từ OrgComposeController#getOrgStructure (org-compose, org-history-info, ...). Phòng
 * ban có parentDeptNo rỗng, 'ROOT' hoặc trỏ tới deptNo không tồn tại trong danh sách đều coi là node gốc,
 * giống đúng logic buildTree() ở bản Thymeleaf/jstree gốc.
 */
export function buildOrgTree<T extends OrgTreeItem>(list: T[]): NzTreeNodeOptions[] {
  const idSet = new Set(list.map((item) => item.deptNo));
  const nodeMap = new Map<string, NzTreeNodeOptions & { children: NzTreeNodeOptions[] }>();
  list.forEach((item) => {
    if (!item.deptNo) return;
    nodeMap.set(item.deptNo, {
      key: item.deptNo,
      title: item.orgNameLocal || item.orgNameEng || item.deptNo,
      children: [],
      isLeaf: true,
    });
  });
  const roots: NzTreeNodeOptions[] = [];
  list.forEach((item) => {
    if (!item.deptNo) return;
    const node = nodeMap.get(item.deptNo)!;
    const parentId = item.parentDeptNo;
    if (!parentId || parentId === 'ROOT' || !idSet.has(parentId)) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(parentId);
      if (parent) {
        parent.children.push(node);
        parent.isLeaf = false;
      } else {
        roots.push(node);
      }
    }
  });
  return roots;
}

export function collectAllTreeKeys(nodes: NzTreeNodeOptions[]): string[] {
  const keys: string[] = [];
  const walk = (list: NzTreeNodeOptions[]) => {
    list.forEach((n) => {
      keys.push(n.key as string);
      if (n.children?.length) walk(n.children as NzTreeNodeOptions[]);
    });
  };
  walk(nodes);
  return keys;
}
