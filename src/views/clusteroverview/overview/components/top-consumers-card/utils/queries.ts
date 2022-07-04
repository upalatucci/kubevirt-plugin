import { TopConsumerMetric as Metric } from './topConsumerMetric';
import { TopConsumerScope as Scope } from './topConsumerScope';

const topConsumerQueries = {
  [Scope.PROJECT.getValue()]: {
    [Metric.CPU.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(container_cpu_usage_seconds_total{container="compute",pod=~"virt-launcher-.*",${namespaceFilter}}[${duration}])) by (namespace))) > 0`,
    [Metric.MEMORY.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(kubevirt_vmi_memory_available_bytes-kubevirt_vmi_memory_usable_bytes{${namespaceFilter}}) by (namespace))) > 0`,
    [Metric.MEMORY_SWAP_TRAFFIC.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(kubevirt_vmi_memory_swap_in_traffic_bytes_total + kubevirt_vmi_memory_swap_out_traffic_bytes_total{${namespaceFilter}}) by (namespace))) > 0`,
    [Metric.VCPU_WAIT.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_vcpu_wait_seconds{${namespaceFilter}}[${duration}])) by (namespace))) > 0`,
    [Metric.STORAGE_THROUGHPUT.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total{${namespaceFilter}}[${duration}]) + rate(kubevirt_vmi_storage_write_traffic_bytes_total{${namespaceFilter}}[${duration}])) by (namespace))) > 0`,
    [Metric.STORAGE_IOPS.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_iops_read_total{${namespaceFilter}}[${duration}]) + rate(kubevirt_vmi_storage_iops_write_total{${namespaceFilter}}[${duration}])) by (namespace))) > 0`,
  },
  [Scope.VM.getValue()]: {
    [Metric.CPU.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(container_cpu_usage_seconds_total{container="compute",pod=~"virt-launcher-.*",${namespaceFilter}}[${duration}])) by (pod, namespace, label_vm_kubevirt_io_name))) + on (pod, namespace) group_left(label_vm_kubevirt_io_name) (0 * topk by (pod,namespace) ( 1,kube_pod_labels{pod=~".*virt-launcher.*"} )) > 0`,
    [Metric.MEMORY.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(kubevirt_vmi_memory_available_bytes-kubevirt_vmi_memory_usable_bytes{${namespaceFilter}}) by(name, namespace))) > 0`,
    [Metric.MEMORY_SWAP_TRAFFIC.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk (${numItemsToShow}, sum(rate(kubevirt_vmi_memory_swap_in_traffic_bytes_total{${namespaceFilter}}[${duration}]) + rate(kubevirt_vmi_memory_swap_out_traffic_bytes_total{${namespaceFilter}}[${duration}]))by(name, namespace))) > 0`,
    [Metric.VCPU_WAIT.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_vcpu_wait_seconds{${namespaceFilter}}[${duration}])) by (namespace, name))) > 0`,
    [Metric.STORAGE_THROUGHPUT.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total{${namespaceFilter}}[${duration}]) + rate(kubevirt_vmi_storage_write_traffic_bytes_total{${namespaceFilter}}[${duration}])) by (namespace, name))) > 0`,
    [Metric.STORAGE_IOPS.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_iops_read_total{${namespaceFilter}}[${duration}]) + rate(kubevirt_vmi_storage_iops_write_total{${namespaceFilter}}[${duration}])) by (namespace, name))) > 0`,
  },
  [Scope.NODE.getValue()]: {
    [Metric.CPU.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(container_cpu_usage_seconds_total{container="compute",pod=~"virt-launcher-.*",${namespaceFilter}}[${duration}])) by (node))) > 0`,
    [Metric.MEMORY.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(kubevirt_vmi_memory_available_bytes-kubevirt_vmi_memory_usable_bytes{${namespaceFilter}}) by(node))) > 0`,
    [Metric.MEMORY_SWAP_TRAFFIC.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(kubevirt_vmi_memory_swap_in_traffic_bytes_total{${namespaceFilter}} + kubevirt_vmi_memory_swap_out_traffic_bytes_total{${namespaceFilter}}) by (node))) > 0`,
    [Metric.VCPU_WAIT.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_vcpu_wait_seconds{${namespaceFilter}}[${duration}])) by (node))) > 0`,
    [Metric.STORAGE_THROUGHPUT.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total{${namespaceFilter}}[${duration}]) + rate(kubevirt_vmi_storage_write_traffic_bytes_total{${namespaceFilter}}[${duration}])) by (node))) > 0`,
    [Metric.STORAGE_IOPS.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_iops_read_total{${namespaceFilter}}[${duration}]) + rate(kubevirt_vmi_storage_iops_write_total{${namespaceFilter}}[${duration}])) by (node))) > 0`,
  },
};

export const getTopConsumerQuery = (
  metric,
  scope,
  numItemsToShow = 5,
  duration = '5m',
  namespace = '',
) =>
  topConsumerQueries[scope][metric](
    numItemsToShow,
    duration,
    namespace ? `namespace='${namespace}'` : '',
  );
