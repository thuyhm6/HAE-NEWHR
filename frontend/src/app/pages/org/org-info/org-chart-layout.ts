import { hierarchy, tree } from 'd3-hierarchy';
import { OrgNodeRow } from './org-info.service';

/** Kích thước 1 card + khoảng cách giữa các card - dùng chung cho d3.tree().nodeSize() và CSS
 *  (.org-card-wrap) nên phải khớp với org-info.component.scss. */
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 140;
export const H_GAP = 40;
export const V_GAP = 60;

/** id giả cho root ảo bọc nhiều cây gốc (roots có thể có nhiều root) - d3.hierarchy() chỉ nhận 1
 *  root duy nhất. Không bao giờ trùng với id thật (id thật là số/uuid từ DB). */
const SYNTHETIC_ROOT_ID = '__org_chart_root__';

/** hậu tố id node ảo gom nhóm các nhân viên (EMP) cùng cha thành 1 ô duy nhất, hiển thị dạng danh sách
 *  dọc (xem org-chart-card.component.html, case 'EMP_GROUP') thay vì mỗi nhân viên 1 ô xếp ngang -
 *  tránh cây bị phình ngang khi 1 phòng ban có nhiều nhân viên trực thuộc. */
const EMP_GROUP_ID_SUFFIX = '__emp_group__';

export interface OrgLayoutNode {
  data: OrgNodeRow;
  x: number;
  y: number;
  hasChildren: boolean;
  collapsed: boolean;
}

export interface OrgLayoutLink {
  id: string;
  path: string;
}

export interface OrgChartLayout {
  nodes: OrgLayoutNode[];
  links: OrgLayoutLink[];
  width: number;
  height: number;
}

/** DEPT xếp trước EMP, cùng loại thì theo tên. */
function sortChildren(a: OrgNodeRow, b: OrgNodeRow): number {
  if (a.type !== b.type) return a.type === 'DEPT' ? -1 : 1;
  return (a.name || '').localeCompare(b.name || '');
}

/** Bọc các con kiểu EMP (nhân viên) của 1 node thành 1 node ảo duy nhất 'EMP_GROUP' - node ảo này luôn
 *  là node lá (không đệ quy tiếp), OrgChartCardComponent render nội dung của nó (children = danh sách
 *  nhân viên gốc) dưới dạng danh sách dọc. Con kiểu DEPT vẫn giữ nguyên, tiếp tục đệ quy bình thường. */
function groupEmpChildren(sortedChildren: OrgNodeRow[], parent: OrgNodeRow): OrgNodeRow[] {
  const depts = sortedChildren.filter((c) => c.type === 'DEPT');
  const emps = sortedChildren.filter((c) => c.type !== 'DEPT');
  if (emps.length === 0) return depts;
  const group: OrgNodeRow = {
    id: `${parent.id}${EMP_GROUP_ID_SUFFIX}`, parentId: parent.id, name: null, title: null,
    type: 'EMP_GROUP', code: null, managerName: null, managerId: null, imageUrl: null,
    level: parent.level + 1, children: emps,
  };
  return [...depts, group];
}

function childrenAccessor(collapsedIds: Set<string>) {
  return (d: OrgNodeRow): OrgNodeRow[] | undefined => {
    if (d.type === 'EMP_GROUP') return undefined;
    if (d.id !== SYNTHETIC_ROOT_ID && collapsedIds.has(d.id)) return undefined;
    if (!d.children || d.children.length === 0) return undefined;
    return groupEmpChildren([...d.children].sort(sortChildren), d);
  };
}

/** Tính tọa độ hiển thị (top-left, để template dùng translate(x,y) trực tiếp) + path đường nối dạng
 *  elbow cho toàn bộ cây, dùng d3.hierarchy/d3.tree. Node đang bị collapse thì bị loại khỏi layout
 *  ngay từ bước dựng hierarchy. */
export function computeOrgChartLayout(roots: OrgNodeRow[], collapsedIds: Set<string>): OrgChartLayout {
  if (roots.length === 0) return { nodes: [], links: [], width: 0, height: 0 };

  const synthetic: OrgNodeRow = {
    id: SYNTHETIC_ROOT_ID, parentId: null, name: null, title: null, type: 'ROOT',
    code: null, managerName: null, managerId: null, imageUrl: null, level: -1, children: roots,
  };

  const root = hierarchy(synthetic, childrenAccessor(collapsedIds));
  tree<OrgNodeRow>().nodeSize([NODE_WIDTH + H_GAP, NODE_HEIGHT + V_GAP])(root);

  const visible = root.descendants().filter((d) => d.depth > 0);
  const minX = Math.min(...visible.map((d) => d.x! - NODE_WIDTH / 2));
  const minY = Math.min(...visible.map((d) => d.y! - NODE_HEIGHT / 2));

  const toLayoutX = (x: number): number => x - NODE_WIDTH / 2 - minX;
  const toLayoutY = (y: number): number => y - NODE_HEIGHT / 2 - minY;

  const nodes: OrgLayoutNode[] = visible.map((d) => ({
    data: d.data,
    x: toLayoutX(d.x!),
    y: toLayoutY(d.y!),
    hasChildren: d.data.type !== 'EMP_GROUP' && !!d.data.children?.length,
    collapsed: collapsedIds.has(d.data.id),
  }));

  const links: OrgLayoutLink[] = root.links()
    .filter((l) => l.source.depth >= 1)
    .map((l) => {
      const sx = toLayoutX(l.source.x!) + NODE_WIDTH / 2;
      const sy = toLayoutY(l.source.y!) + NODE_HEIGHT;
      const tx = toLayoutX(l.target.x!) + NODE_WIDTH / 2;
      const ty = toLayoutY(l.target.y!);
      const midY = (sy + ty) / 2;
      return {
        id: `${l.source.data.id}->${l.target.data.id}`,
        path: `M${sx},${sy} V${midY} H${tx} V${ty}`,
      };
    });

  const width = Math.max(0, ...nodes.map((n) => n.x + NODE_WIDTH));
  const height = Math.max(0, ...nodes.map((n) => n.y + NODE_HEIGHT));

  return { nodes, links, width, height };
}
