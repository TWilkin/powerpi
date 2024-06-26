import { PowerPiApi } from "@powerpi/common-api";
import { RenderHookOptions, RenderOptions, render, renderHook } from "@testing-library/react";
import { PropsWithChildren, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { instance, mock } from "ts-mockito";
import { PowerPiAPIContextProvider } from "./hooks/api";

type CommonProps = {
    api?: PowerPiApi;
    queryClient?: QueryClient;
};

/** Extract our options from those used by `render`/`renderHook` and initialise those that aren't set. */
function setupOptions<TOptionType extends CommonProps>(options?: TOptionType) {
    let { api, queryClient, ...defaultOptions } = options ?? {};

    api ??= instance(mock<PowerPiApi>());
    queryClient ??= new QueryClient();

    defaultOptions = {
        ...defaultOptions,
        wrapper: ({ children }: PropsWithChildren<unknown>) => (
            <Wrapper api={api} queryClient={queryClient}>
                {children}
            </Wrapper>
        ),
    };

    return defaultOptions;
}

/** Wrap `render` method to setup the API and `react-query`. */
function customRender(component: ReactNode, options?: RenderOptions & CommonProps) {
    const defaultOptions = setupOptions(options);

    return render(component, defaultOptions);
}

/** Wrap `renderHook` method to setup the API and `react-query`. */
function customRenderHook<TResultType, TPropsType>(
    render: (initialProps: TPropsType) => TResultType,
    options?: RenderHookOptions<TResultType> & CommonProps,
) {
    const defaultOptions = setupOptions(options);

    return renderHook(render, defaultOptions);
}

type WrapperProps = PropsWithChildren<Required<CommonProps>>;

/** The `Wrapper` component simply wraps the component/hook under test with the API and `react-query` providers. */
const Wrapper = ({ api, queryClient, children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>
        <PowerPiAPIContextProvider api={api}>{children}</PowerPiAPIContextProvider>
    </QueryClientProvider>
);

export * from "@testing-library/react";
export { customRender as render, customRenderHook as renderHook };
