import { Node, Edge } from 'reactflow';
import { CustomNodeData, ValidationError, NodeShape } from './types';

export class FlowchartValidator {
  /**
   * フローチャート全体のバリデーションを実行
   */
  static validateFlowchart(
    nodes: Node<CustomNodeData>[], 
    edges: Edge[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // 各種バリデーションを実行
    errors.push(...this.validateNodes(nodes));
    errors.push(...this.validateEdges(nodes, edges));
    errors.push(...this.validateFlow(nodes, edges));
    errors.push(...this.validateBusinessRules(nodes, edges));

    return errors;
  }

  /**
   * ノード単体のバリデーション
   */
  private static validateNodes(nodes: Node<CustomNodeData>[]): ValidationError[] {
    const errors: ValidationError[] = [];

    nodes.forEach(node => {
      const { id, data } = node;

      // 必須フィールドのチェック
      if (!data.label || data.label.trim() === '') {
        errors.push({
          id: `node-${id}-label`,
          type: 'error',
          message: 'ノードにはラベルが必要です',
          nodeId: id
        });
      }

      // ラベルの長さチェック
      if (data.label && data.label.length > 50) {
        errors.push({
          id: `node-${id}-label-length`,
          type: 'warning',
          message: 'ラベルが長すぎます（50文字以内を推奨）',
          nodeId: id
        });
      }

      // 業務属性のバリデーション
      if (data.businessAttributes) {
        const { estimatedTime, priority, dueDate } = data.businessAttributes;

        // 想定時間のチェック
        if (estimatedTime !== undefined && estimatedTime <= 0) {
          errors.push({
            id: `node-${id}-time`,
            type: 'warning',
            message: '想定時間は正の値である必要があります',
            nodeId: id
          });
        }

        // 期限のチェック
        if (dueDate && new Date(dueDate) < new Date()) {
          errors.push({
            id: `node-${id}-due-date`,
            type: 'warning',
            message: '期限が過去の日付に設定されています',
            nodeId: id
          });
        }
      }
    });

    return errors;
  }

  /**
   * エッジのバリデーション
   */
  private static validateEdges(
    nodes: Node<CustomNodeData>[], 
    edges: Edge[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const nodeIds = new Set(nodes.map(n => n.id));

    edges.forEach(edge => {
      // 存在しないノードへの参照チェック
      if (!nodeIds.has(edge.source)) {
        errors.push({
          id: `edge-${edge.id}-source`,
          type: 'error',
          message: `エッジの接続元ノード (${edge.source}) が存在しません`,
          edgeId: edge.id
        });
      }

      if (!nodeIds.has(edge.target)) {
        errors.push({
          id: `edge-${edge.id}-target`,
          type: 'error',
          message: `エッジの接続先ノード (${edge.target}) が存在しません`,
          edgeId: edge.id
        });
      }

      // 自己参照チェック
      if (edge.source === edge.target) {
        errors.push({
          id: `edge-${edge.id}-self`,
          type: 'warning',
          message: 'ノードが自分自身に接続されています',
          edgeId: edge.id
        });
      }
    });

    return errors;
  }

  /**
   * フロー構造のバリデーション
   */
  private static validateFlow(
    nodes: Node<CustomNodeData>[], 
    edges: Edge[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // 開始ノードと終了ノードのチェック
    const startNodes = nodes.filter(n => n.data.shape === 'startEnd' && 
      !edges.some(e => e.target === n.id));
    const endNodes = nodes.filter(n => n.data.shape === 'startEnd' && 
      !edges.some(e => e.source === n.id));

    if (startNodes.length === 0) {
      errors.push({
        id: 'flow-no-start',
        type: 'warning',
        message: '開始ノードが見つかりません'
      });
    }

    if (startNodes.length > 1) {
      errors.push({
        id: 'flow-multiple-starts',
        type: 'warning',
        message: '複数の開始ノードがあります'
      });
    }

    if (endNodes.length === 0) {
      errors.push({
        id: 'flow-no-end',
        type: 'warning',
        message: '終了ノードが見つかりません'
      });
    }

    // 未接続ノードのチェック
    const orphanNodes = nodes.filter(node => 
      !edges.some(e => e.source === node.id || e.target === node.id));

    orphanNodes.forEach(node => {
      errors.push({
        id: `node-${node.id}-orphan`,
        type: 'warning',
        message: 'ノードが他のノードと接続されていません',
        nodeId: node.id
      });
    });

    // デッドエンドのチェック（終了ノード以外で出力がない）
    const deadEndNodes = nodes.filter(node => 
      node.data.shape !== 'startEnd' && 
      !edges.some(e => e.source === node.id));

    deadEndNodes.forEach(node => {
      errors.push({
        id: `node-${node.id}-dead-end`,
        type: 'warning',
        message: 'ノードに出力がありません（デッドエンド）',
        nodeId: node.id
      });
    });

    // 条件分岐ノードの出力数チェック
    const decisionNodes = nodes.filter(n => n.data.shape === 'diamond');
    decisionNodes.forEach(node => {
      const outgoingEdges = edges.filter(e => e.source === node.id);
      if (outgoingEdges.length < 2) {
        errors.push({
          id: `node-${node.id}-decision-outputs`,
          type: 'warning',
          message: '条件分岐ノードには少なくとも2つの出力が必要です',
          nodeId: node.id
        });
      }
    });

    return errors;
  }

  /**
   * 業務ルールのバリデーション
   */
  private static validateBusinessRules(
    nodes: Node<CustomNodeData>[], 
    edges: Edge[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // 想定時間の合計チェック
    const totalEstimatedTime = nodes.reduce((total, node) => {
      const time = node.data.businessAttributes?.estimatedTime || 0;
      return total + time;
    }, 0);

    if (totalEstimatedTime > 8 * 60) { // 8時間 = 480分
      errors.push({
        id: 'flow-time-excessive',
        type: 'warning',
        message: `プロセス全体の想定時間が長すぎます (${Math.round(totalEstimatedTime / 60)}時間)`
      });
    }

    // 優先度の一貫性チェック
    const hasCriticalNodes = nodes.some(n => 
      n.data.businessAttributes?.priority === 'critical');
    const hasLowPriorityNodes = nodes.some(n => 
      n.data.businessAttributes?.priority === 'low');

    if (hasCriticalNodes && hasLowPriorityNodes) {
      errors.push({
        id: 'flow-priority-inconsistency',
        type: 'warning',
        message: '同一フロー内に重要度の高いタスクと低いタスクが混在しています'
      });
    }

    // 部署の分散チェック
    const departments = new Set(
      nodes
        .map(n => n.data.businessAttributes?.department)
        .filter(Boolean)
    );

    if (departments.size > 5) {
      errors.push({
        id: 'flow-department-fragmentation',
        type: 'warning',
        message: '多数の部署にまたがるプロセスです。簡素化を検討してください'
      });
    }

    return errors;
  }

  /**
   * リアルタイムバリデーション（軽量版）
   */
  static validateRealtime(
    nodes: Node<CustomNodeData>[], 
    edges: Edge[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // 基本的なチェックのみ実行
    errors.push(...this.validateNodes(nodes));
    
    // 重要なフロー構造のみチェック
    const orphanNodes = nodes.filter(node => 
      !edges.some(e => e.source === node.id || e.target === node.id));

    orphanNodes.forEach(node => {
      errors.push({
        id: `node-${node.id}-orphan-rt`,
        type: 'warning',
        message: '未接続のノードです',
        nodeId: node.id
      });
    });

    return errors;
  }

  /**
   * バリデーションエラーをレベル別に分類
   */
  static categorizeErrors(errors: ValidationError[]): {
    errors: ValidationError[];
    warnings: ValidationError[];
  } {
    return {
      errors: errors.filter(e => e.type === 'error'),
      warnings: errors.filter(e => e.type === 'warning')
    };
  }
} 