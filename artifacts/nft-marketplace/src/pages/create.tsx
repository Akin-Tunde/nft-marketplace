import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useCreateNft,
  useCreateCollection,
  useListCollections,
} from "@workspace/api-client-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/context/wallet";
import { Paintbrush, LayoutGrid, Wallet } from "lucide-react";
import { Link } from "wouter";

const mintFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  image: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
  collectionId: z.string().optional(),
  owner: z.string().min(1, "Owner address is required"),
  royaltyPercent: z.coerce.number().min(0).max(50).default(0),
});

const collectionFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  creator: z.string().min(1, "Creator address is required"),
  coverImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export default function Create() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("nft");
  const { address, isConnected } = useWallet();

  const { data: collections } = useListCollections();

  const createNft = useCreateNft();
  const createCollection = useCreateCollection();

  const mintForm = useForm<z.infer<typeof mintFormSchema>>({
    resolver: zodResolver(mintFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      owner: address ?? "",
      royaltyPercent: 0,
      collectionId: undefined,
    },
  });

  const collectionForm = useForm<z.infer<typeof collectionFormSchema>>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      creator: address ?? "",
      coverImage: "",
    },
  });

  useEffect(() => {
    if (address) {
      mintForm.setValue("owner", address);
      collectionForm.setValue("creator", address);
    }
  }, [address]);

  const onMintSubmit = (data: z.infer<typeof mintFormSchema>) => {
    createNft.mutate(
      {
        data: {
          ...data,
          collectionId: data.collectionId ? Number(data.collectionId) : undefined,
        },
      },
      {
        onSuccess: (res) => {
          toast({ title: "Artwork minted", description: `"${res.title}" is now on the blockchain.` });
          setLocation(`/nfts/${res.id}`);
        },
        onError: () => {
          toast({
            title: "Minting failed",
            description: "Could not mint this artwork. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const onCollectionSubmit = (data: z.infer<typeof collectionFormSchema>) => {
    createCollection.mutate(
      {
        data: {
          ...data,
          coverImage: data.coverImage || undefined,
        },
      },
      {
        onSuccess: (res) => {
          toast({ title: "Collection created", description: `"${res.name}" is live.` });
          setLocation(`/collections/${res.id}`);
        },
        onError: () => {
          toast({
            title: "Creation failed",
            description: "Could not create this collection. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-medium mb-4">Studio</h1>
        <p className="text-muted-foreground text-lg">
          Mint new artworks or organize your pieces into collections.
        </p>
      </div>

      {isConnected && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-8">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Creating as</p>
            <p className="font-mono text-sm text-primary font-medium">{address}</p>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 mb-8">
          <Wallet className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Connect a wallet to auto-fill your address.{" "}
            <span className="text-foreground font-medium">Use the button in the nav bar.</span>
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 p-1 mb-8 rounded-xl">
          <TabsTrigger
            value="nft"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-base"
          >
            <Paintbrush className="w-4 h-4 mr-2" />
            Mint Artwork
          </TabsTrigger>
          <TabsTrigger
            value="collection"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-base"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Create Collection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nft" className="mt-0 outline-none">
          <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8">
            <Form {...mintForm}>
              <form
                onSubmit={mintForm.handleSubmit(onMintSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={mintForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Neon Genesis"
                            className="bg-muted/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={mintForm.control}
                    name="owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creator Wallet Address *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0x..."
                            className={`bg-muted/30 font-mono text-sm ${isConnected ? "text-primary" : ""}`}
                            readOnly={isConnected}
                            {...field}
                          />
                        </FormControl>
                        {isConnected && (
                          <FormDescription className="text-primary/60">
                            Auto-filled from connected wallet.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={mintForm.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          className="bg-muted/30"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        High-resolution image hosted on IPFS, Arweave, or HTTPS.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={mintForm.control}
                    name="collectionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-muted/30">
                              <SelectValue placeholder="Select a collection (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {collections?.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={mintForm.control}
                    name="royaltyPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Royalty Percentage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            className="bg-muted/30"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Earned on secondary sales (0–50%).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={mintForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell the story behind this piece..."
                          className="min-h-[120px] bg-muted/30 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-base"
                  disabled={createNft.isPending}
                  data-testid="button-submit-mint"
                >
                  {createNft.isPending ? "Minting..." : "Mint Artwork"}
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>

        <TabsContent value="collection" className="mt-0 outline-none">
          <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8">
            <Form {...collectionForm}>
              <form
                onSubmit={collectionForm.handleSubmit(onCollectionSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={collectionForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. The Genesis Drop"
                            className="bg-muted/30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={collectionForm.control}
                    name="creator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creator Wallet Address *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0x..."
                            className={`bg-muted/30 font-mono text-sm ${isConnected ? "text-primary" : ""}`}
                            readOnly={isConnected}
                            {...field}
                          />
                        </FormControl>
                        {isConnected && (
                          <FormDescription className="text-primary/60">
                            Auto-filled from connected wallet.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={collectionForm.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          className="bg-muted/30"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Banner image for the collection page.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={collectionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the themes and intent behind this collection..."
                          className="min-h-[120px] bg-muted/30 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-base"
                  disabled={createCollection.isPending}
                  data-testid="button-submit-collection"
                >
                  {createCollection.isPending ? "Creating..." : "Create Collection"}
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
